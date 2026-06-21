import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as storage from "./storage";
import { calculateChallengeStatus, updateChallengeStatus, resetChallenge, suspendTrader, activateTrader, getChallengeCountdown } from "./challengeEngine";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ADMIN_USERNAME = "Linn Htet Aung";
const ADMIN_PASSWORD_BCRYPT = "$2b$10$Ho1jXxRgWJMsVNqo/8BREOvee8HKkV/PQGS7f6LEkMUKq1c3r6DtS"; // lhaung2006
const TRADER_USERNAME = "Sai Myat Aung";
const TRADER_PASSWORD_BCRYPT = "$2b$10$hFcQx77CqcMIq2oLXJxsq.2SEHGaplK8A7GcxoR4se3nY3ob3JAnK"; // smaung2006

// Login attempt tracking for rate limiting
const loginAttempts: { [key: string]: { count: number; lastAttempt: number } } = {};
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Middleware to verify admin token
function verifyAdminToken(req: any, res: any, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware to verify trader token
function verifyTraderToken(req: any, res: any, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "trader") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Rate limiting
    const key = `admin_${username}`;
    const now = Date.now();
    if (loginAttempts[key]) {
      if (loginAttempts[key].count >= RATE_LIMIT_ATTEMPTS) {
        if (now - loginAttempts[key].lastAttempt < RATE_LIMIT_WINDOW) {
          return res.status(429).json({ error: "Too many login attempts. Try again later." });
        } else {
          loginAttempts[key] = { count: 0, lastAttempt: now };
        }
      }
    } else {
      loginAttempts[key] = { count: 0, lastAttempt: now };
    }

    // Check credentials
    if (username !== ADMIN_USERNAME) {
      loginAttempts[key].count++;
      loginAttempts[key].lastAttempt = now;
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_BCRYPT);
    if (!passwordMatch) {
      loginAttempts[key].count++;
      loginAttempts[key].lastAttempt = now;
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Clear login attempts on success
    delete loginAttempts[key];

    // Generate token
    const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, username });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Trader login - using account number
router.post("/trader/login", async (req, res) => {
  try {
    const { accountNumber, password } = req.body;

    if (!accountNumber || !password) {
      return res.status(400).json({ error: "Account number and password required" });
    }

    // Rate limiting
    const key = `trader_${accountNumber}`;
    const now = Date.now();
    if (loginAttempts[key]) {
      if (loginAttempts[key].count >= RATE_LIMIT_ATTEMPTS) {
        if (now - loginAttempts[key].lastAttempt < RATE_LIMIT_WINDOW) {
          return res.status(429).json({ error: "Too many login attempts. Try again later." });
        } else {
          loginAttempts[key] = { count: 0, lastAttempt: now };
        }
      }
    } else {
      loginAttempts[key] = { count: 0, lastAttempt: now };
    }

    // Find trader by account number
    const trader = storage.getTraderByAccountNumber(accountNumber);
    if (!trader) {
      loginAttempts[key].count++;
      loginAttempts[key].lastAttempt = now;
      return res.status(401).json({ error: "Invalid account number or password" });
    }

    // Verify password (for demo, we accept the demo trader password)
    const passwordMatch = await bcrypt.compare(password, TRADER_PASSWORD_BCRYPT);
    if (!passwordMatch) {
      loginAttempts[key].count++;
      loginAttempts[key].lastAttempt = now;
      return res.status(401).json({ error: "Invalid account number or password" });
    }

    // Check trader status
    if (trader.traderStatus !== "active") {
      return res.status(403).json({ error: "Trader account is not active" });
    }

    // Clear login attempts on success
    delete loginAttempts[key];

    // Generate token
    const token = jwt.sign({ accountNumber, traderId: trader.id, traderName: trader.traderName, role: "trader" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, accountNumber, traderId: trader.id, traderName: trader.traderName });
  } catch (error) {
    console.error("Trader login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify trader token
router.post("/trader/verify", verifyTraderToken, (req: any, res) => {
  try {
    const trader = storage.getTraderById(req.user.traderId);
    if (!trader) {
      return res.status(404).json({ error: "Trader not found" });
    }
    res.json({ valid: true, trader });
  } catch (error) {
    console.error("Trader verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Get all traders
router.get("/admin/traders", verifyAdminToken, (req, res) => {
  try {
    const allTraders = storage.getAllTraders();
    res.json(allTraders);
  } catch (error) {
    console.error("Get traders error:", error);
    res.status(500).json({ error: "Failed to fetch traders" });
  }
});

// Create new trader
router.post("/admin/traders", verifyAdminToken, (req, res) => {
  try {
    const { traderName, email, accountNumber, balance, equity, profitTarget, dailyDrawdownLimit, maxDrawdownLimit, tradingDaysLimit } = req.body;

    if (!traderName || !email || !accountNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create trader
    const newTrader = storage.createTrader({
      traderName,
      email,
      accountNumber,
      challengeStatus: "active",
      traderStatus: "active",
    });

    // Create trading metrics
    storage.upsertMetrics(newTrader.id, {
      balance: balance || 10000,
      equity: equity || 10000,
      profitTarget: profitTarget || 1000,
      dailyDrawdown: 0,
      dailyDrawdownLimit: dailyDrawdownLimit || -500,
      maxDrawdown: 0,
      maxDrawdownLimit: maxDrawdownLimit || -1000,
      tradingDaysUsed: 0,
      tradingDaysLimit: tradingDaysLimit || 30,
      winRate: 0,
      totalTrades: 0,
      challengeStartDate: new Date().toISOString(),
    });

    // Create challenge rules
    storage.upsertChallengeRules(newTrader.id, {
      accountSize: balance || 10000,
      profitTarget: profitTarget || 1000,
      dailyDrawdownLimit: dailyDrawdownLimit || -500,
      maxDrawdownLimit: maxDrawdownLimit || -1000,
      minTradingDays: 1,
    });

    res.status(201).json(newTrader);
  } catch (error) {
    console.error("Create trader error:", error);
    res.status(500).json({ error: "Failed to create trader" });
  }
});

// Get trader by ID
router.get("/admin/trader/:traderId", verifyAdminToken, (req, res) => {
  try {
    const trader = storage.getTraderById(parseInt(req.params.traderId));
    if (!trader) {
      return res.status(404).json({ error: "Trader not found" });
    }
    res.json(trader);
  } catch (error) {
    console.error("Get trader error:", error);
    res.status(500).json({ error: "Failed to fetch trader" });
  }
});

// Update trader
router.put("/admin/trader/:traderId", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);
    const updates = req.body;

    const updated = storage.updateTrader(traderId, updates);
    if (!updated) {
      return res.status(404).json({ error: "Trader not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update trader error:", error);
    res.status(500).json({ error: "Failed to update trader" });
  }
});

// Delete trader
router.delete("/admin/trader/:traderId", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);

    const deleted = storage.deleteTrader(traderId);
    if (!deleted) {
      return res.status(404).json({ error: "Trader not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete trader error:", error);
    res.status(500).json({ error: "Failed to delete trader" });
  }
});

// Get trader metrics
router.get("/admin/trader/:traderId/metrics", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);
    const metrics = storage.getMetricsByTraderId(traderId);

    if (!metrics) {
      return res.status(404).json({ error: "Metrics not found" });
    }

    res.json(metrics);
  } catch (error) {
    console.error("Get metrics error:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// Update trader metrics
router.put("/admin/trader/:traderId/metrics", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);
    const updates = req.body;

    const metrics = storage.upsertMetrics(traderId, updates);
    res.json(metrics);
  } catch (error) {
    console.error("Update metrics error:", error);
    res.status(500).json({ error: "Failed to update metrics" });
  }
});

// Get trader challenge status
router.get("/admin/trader/:traderId/challenge-status", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);
    const trader = storage.getTraderById(traderId);
    const metrics = storage.getMetricsByTraderId(traderId);

    if (!trader || !metrics) {
      return res.status(404).json({ error: "Trader or metrics not found" });
    }

    const status = calculateChallengeStatus(metrics as any);
    res.json({ status, metrics });
  } catch (error) {
    console.error("Get challenge status error:", error);
    res.status(500).json({ error: "Failed to fetch challenge status" });
  }
});

// Reset challenge
router.post("/admin/trader/:traderId/reset-challenge", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);

    const updated = storage.updateTrader(traderId, { challengeStatus: "active" });
    if (!updated) {
      return res.status(404).json({ error: "Trader not found" });
    }

    // Reset metrics
    storage.upsertMetrics(traderId, {
      dailyDrawdown: 0,
      maxDrawdown: 0,
      tradingDaysUsed: 0,
      winRate: 0,
      totalTrades: 0,
      challengeStartDate: new Date().toISOString(),
    });

    res.json({ success: true, trader: updated });
  } catch (error) {
    console.error("Reset challenge error:", error);
    res.status(500).json({ error: "Failed to reset challenge" });
  }
});

// Suspend trader
router.post("/admin/trader/:traderId/suspend", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);

    const updated = storage.updateTrader(traderId, { traderStatus: "suspended" });
    if (!updated) {
      return res.status(404).json({ error: "Trader not found" });
    }

    res.json({ success: true, trader: updated });
  } catch (error) {
    console.error("Suspend trader error:", error);
    res.status(500).json({ error: "Failed to suspend trader" });
  }
});

// Activate trader
router.post("/admin/trader/:traderId/activate", verifyAdminToken, (req, res) => {
  try {
    const traderId = parseInt(req.params.traderId);

    const updated = storage.updateTrader(traderId, { traderStatus: "active" });
    if (!updated) {
      return res.status(404).json({ error: "Trader not found" });
    }

    res.json({ success: true, trader: updated });
  } catch (error) {
    console.error("Activate trader error:", error);
    res.status(500).json({ error: "Failed to activate trader" });
  }
});

// Get trader dashboard data
router.get("/trader/dashboard", verifyTraderToken, (req: any, res) => {
  try {
    const traderId = req.user.traderId;
    const trader = storage.getTraderById(traderId);
    const metrics = storage.getMetricsByTraderId(traderId);

    if (!trader || !metrics) {
      return res.status(404).json({ error: "Trader or metrics not found" });
    }

    const status = calculateChallengeStatus(metrics as any);

    res.json({
      trader,
      metrics,
      status,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get challenge countdown
router.get("/trader/challenge-countdown", verifyTraderToken, (req: any, res) => {
  try {
    const traderId = req.user.traderId;
    const metrics = storage.getMetricsByTraderId(traderId);

    if (!metrics) {
      return res.status(404).json({ error: "Metrics not found" });
    }

    const countdown = getChallengeCountdown(new Date(metrics.challengeStartDate), metrics.tradingDaysLimit);
    res.json(countdown);
  } catch (error) {
    console.error("Get countdown error:", error);
    res.status(500).json({ error: "Failed to fetch countdown" });
  }
});

export default router;
