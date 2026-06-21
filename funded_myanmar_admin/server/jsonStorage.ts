import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TRADERS_FILE = path.join(DATA_DIR, "traders.json");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");
const CHALLENGE_RULES_FILE = path.join(DATA_DIR, "challengeRules.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize JSON files if they don't exist
function initializeFiles() {
  ensureDataDir();

  if (!fs.existsSync(TRADERS_FILE)) {
    fs.writeFileSync(TRADERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(METRICS_FILE)) {
    fs.writeFileSync(METRICS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(CHALLENGE_RULES_FILE)) {
    fs.writeFileSync(CHALLENGE_RULES_FILE, JSON.stringify([], null, 2));
  }
}

// Read traders from JSON file
export function readTraders(): any[] {
  try {
    initializeFiles();
    const data = fs.readFileSync(TRADERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading traders:", error);
    return [];
  }
}

// Write traders to JSON file
export function writeTraders(traders: any[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(TRADERS_FILE, JSON.stringify(traders, null, 2));
  } catch (error) {
    console.error("Error writing traders:", error);
    throw error;
  }
}

// Read metrics from JSON file
export function readMetrics(): any[] {
  try {
    initializeFiles();
    const data = fs.readFileSync(METRICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading metrics:", error);
    return [];
  }
}

// Write metrics to JSON file
export function writeMetrics(metrics: any[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error("Error writing metrics:", error);
    throw error;
  }
}

// Read challenge rules from JSON file
export function readChallengeRules(): any[] {
  try {
    initializeFiles();
    const data = fs.readFileSync(CHALLENGE_RULES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading challenge rules:", error);
    return [];
  }
}

// Write challenge rules to JSON file
export function writeChallengeRules(rules: any[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(CHALLENGE_RULES_FILE, JSON.stringify(rules, null, 2));
  } catch (error) {
    console.error("Error writing challenge rules:", error);
    throw error;
  }
}

// Create trader in JSON storage
export function createTraderJSON(traderData: any): any {
  try {
    const traders = readTraders();
    const newTrader = {
      id: traders.length > 0 ? Math.max(...traders.map((t) => t.id)) + 1 : 1,
      ...traderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    traders.push(newTrader);
    writeTraders(traders);

    return newTrader;
  } catch (error) {
    console.error("Error creating trader in JSON:", error);
    throw error;
  }
}

// Get trader by ID from JSON storage
export function getTraderByIdJSON(traderId: number): any {
  try {
    const traders = readTraders();
    return traders.find((t) => t.id === traderId);
  } catch (error) {
    console.error("Error getting trader from JSON:", error);
    return null;
  }
}

// Update trader in JSON storage
export function updateTraderJSON(traderId: number, updates: any): any {
  try {
    const traders = readTraders();
    const index = traders.findIndex((t) => t.id === traderId);

    if (index === -1) {
      throw new Error("Trader not found");
    }

    traders[index] = {
      ...traders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeTraders(traders);
    return traders[index];
  } catch (error) {
    console.error("Error updating trader in JSON:", error);
    throw error;
  }
}

// Delete trader from JSON storage
export function deleteTraderJSON(traderId: number): boolean {
  try {
    const traders = readTraders();
    const metrics = readMetrics();

    const traderIndex = traders.findIndex((t) => t.id === traderId);
    if (traderIndex === -1) {
      throw new Error("Trader not found");
    }

    traders.splice(traderIndex, 1);
    writeTraders(traders);

    // Delete associated metrics
    const updatedMetrics = metrics.filter((m) => m.traderId !== traderId);
    writeMetrics(updatedMetrics);

    return true;
  } catch (error) {
    console.error("Error deleting trader from JSON:", error);
    throw error;
  }
}

// Get all traders from JSON storage
export function getAllTradersJSON(): any[] {
  try {
    return readTraders();
  } catch (error) {
    console.error("Error getting all traders from JSON:", error);
    return [];
  }
}

// Create or update metrics in JSON storage
export function upsertMetricsJSON(traderId: number, metricsData: any): any {
  try {
    const metrics = readMetrics();
    const index = metrics.findIndex((m) => m.traderId === traderId);

    if (index === -1) {
      const newMetrics = {
        id: metrics.length > 0 ? Math.max(...metrics.map((m) => m.id)) + 1 : 1,
        traderId,
        ...metricsData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      metrics.push(newMetrics);
      writeMetrics(metrics);
      return newMetrics;
    } else {
      metrics[index] = {
        ...metrics[index],
        ...metricsData,
        updatedAt: new Date().toISOString(),
      };

      writeMetrics(metrics);
      return metrics[index];
    }
  } catch (error) {
    console.error("Error upserting metrics in JSON:", error);
    throw error;
  }
}

// Get metrics by trader ID from JSON storage
export function getMetricsByTraderIdJSON(traderId: number): any {
  try {
    const metrics = readMetrics();
    return metrics.find((m) => m.traderId === traderId);
  } catch (error) {
    console.error("Error getting metrics from JSON:", error);
    return null;
  }
}
