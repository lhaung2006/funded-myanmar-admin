import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { traders, tradingMetrics, challengeRules } from "../drizzle/schema";

/**
 * Challenge Rules Engine
 * Handles all challenge calculations and automatic status updates
 */

export interface ChallengeStatus {
  status: "active" | "passed" | "failed" | "suspended";
  reason?: string;
  remainingProfitTarget: number;
  remainingDailyDrawdown: number;
  remainingMaxDrawdown: number;
  progressPercentage: number;
  profitFactor: number;
}

export interface ChallengeCalculations {
  remainingProfitTarget: number;
  remainingDailyDrawdown: number;
  remainingMaxDrawdown: number;
  progressPercentage: number;
  profitFactor: number;
  isPassedCondition: boolean;
  isFailedDailyDrawdown: boolean;
  isFailedMaxDrawdown: boolean;
}

/**
 * Calculate all challenge metrics and determine status
 */
export async function calculateChallengeStatus(traderId: number): Promise<ChallengeStatus> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get trader info
  const traderList = await db.select().from(traders).where(eq(traders.id, traderId));
  if (traderList.length === 0) {
    throw new Error("Trader not found");
  }
  const trader = traderList[0];

  // Get trading metrics
  const metricsList = await db.select().from(tradingMetrics).where(eq(tradingMetrics.traderId, traderId));
  if (metricsList.length === 0) {
    throw new Error("Trading metrics not found");
  }
  const metrics = metricsList[0];

  // Get challenge rules
  const rulesList = await db.select().from(challengeRules).where(eq(challengeRules.traderId, traderId));
  const rules = rulesList.length > 0 ? rulesList[0] : null;

  // Calculate all metrics
  const calculations = calculateMetrics(metrics, rules);

  // Determine status
  let status: "active" | "passed" | "failed" | "suspended" = "active";
  let reason: string | undefined;

  // Check if trader is suspended
  if (trader.traderStatus === "suspended") {
    status = "suspended";
    reason = "Trader account is suspended";
  }
  // Check if challenge is already passed or failed
  else if (trader.challengeStatus === "passed") {
    status = "passed";
    reason = "Challenge completed successfully";
  } else if (trader.challengeStatus === "failed") {
    status = "failed";
    reason = "Challenge failed - rules breached";
  }
  // Check for automatic pass condition
  else if (calculations.isPassedCondition) {
    status = "passed";
    reason = "Profit target reached";
  }
  // Check for automatic fail conditions
  else if (calculations.isFailedDailyDrawdown) {
    status = "failed";
    reason = "Daily drawdown limit exceeded";
  } else if (calculations.isFailedMaxDrawdown) {
    status = "failed";
    reason = "Maximum drawdown limit exceeded";
  }

  return {
    status,
    reason,
    remainingProfitTarget: calculations.remainingProfitTarget,
    remainingDailyDrawdown: calculations.remainingDailyDrawdown,
    remainingMaxDrawdown: calculations.remainingMaxDrawdown,
    progressPercentage: calculations.progressPercentage,
    profitFactor: calculations.profitFactor,
  };
}

/**
 * Calculate all challenge metrics
 */
export function calculateMetrics(
  metrics: any,
  rules: any | null
): ChallengeCalculations {
  // Current profit/loss
  const currentProfit = metrics.equity - metrics.balance;

  // Remaining profit target (in cents)
  const remainingProfitTarget = Math.max(0, metrics.profitTarget - currentProfit);

  // Remaining daily drawdown (in cents)
  const remainingDailyDrawdown = Math.max(0, metrics.dailyDrawdownLimit - Math.abs(metrics.dailyDrawdown));

  // Remaining maximum drawdown (in cents)
  const remainingMaxDrawdown = Math.max(0, metrics.maxDrawdownLimit - Math.abs(metrics.maxDrawdown));

  // Progress percentage (0-100)
  const progressPercentage =
    metrics.profitTarget > 0 ? Math.min(100, (currentProfit / metrics.profitTarget) * 100) : 0;

  // Profit factor calculation
  // Profit Factor = Gross Profit / Gross Loss
  // For now, calculate based on win rate and total trades
  const profitFactor = calculateProfitFactor(metrics);

  // Check pass condition: profit target reached
  const isPassedCondition = currentProfit >= metrics.profitTarget && metrics.profitTarget > 0;

  // Check fail conditions
  const isFailedDailyDrawdown = Math.abs(metrics.dailyDrawdown) > metrics.dailyDrawdownLimit;
  const isFailedMaxDrawdown = Math.abs(metrics.maxDrawdown) > metrics.maxDrawdownLimit;

  return {
    remainingProfitTarget,
    remainingDailyDrawdown,
    remainingMaxDrawdown,
    progressPercentage,
    profitFactor,
    isPassedCondition,
    isFailedDailyDrawdown,
    isFailedMaxDrawdown,
  };
}

/**
 * Calculate profit factor
 * Simplified calculation based on win rate and total trades
 */
function calculateProfitFactor(metrics: any): number {
  if (metrics.totalTrades === 0) {
    return 0;
  }

  const winCount = Math.round((metrics.winRate / 100) * metrics.totalTrades);
  const lossCount = metrics.totalTrades - winCount;

  if (lossCount === 0) {
    return winCount > 0 ? 999.99 : 0; // Cap at 999.99 for perfect record
  }

  // Simplified: assume average win = average loss
  // Profit Factor = (Win Count * Avg Win) / (Loss Count * Avg Loss)
  // If we assume equal risk/reward: Profit Factor = Win Count / Loss Count
  const profitFactor = winCount / lossCount;

  return Math.round(profitFactor * 100) / 100; // Round to 2 decimals
}

/**
 * Update trader status based on challenge rules
 */
export async function updateChallengeStatus(traderId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const status = await calculateChallengeStatus(traderId);

  // Only update if status has changed
  const traderList = await db.select().from(traders).where(eq(traders.id, traderId));
  if (traderList.length === 0) {
    return;
  }

  const trader = traderList[0];
  if (trader.challengeStatus !== status.status) {
    await db
      .update(traders)
      .set({
        challengeStatus: status.status,
        updatedAt: new Date(),
      })
      .where(eq(traders.id, traderId));
  }
}

/**
 * Reset challenge for a trader
 */
export async function resetChallenge(traderId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const now = new Date();

  // Reset trading metrics
  await db
    .update(tradingMetrics)
    .set({
      dailyDrawdown: 0,
      maxDrawdown: 0,
      tradingDaysUsed: 0,
      winRate: 0,
      totalTrades: 0,
      challengeStartDate: now,
      challengeEndDate: null,
      updatedAt: now,
    })
    .where(eq(tradingMetrics.traderId, traderId));

  // Reset trader status
  await db
    .update(traders)
    .set({
      challengeStatus: "active",
      traderStatus: "active",
      updatedAt: now,
    })
    .where(eq(traders.id, traderId));
}

/**
 * Suspend trader
 */
export async function suspendTrader(traderId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(traders)
    .set({
      traderStatus: "suspended",
      challengeStatus: "suspended",
      updatedAt: new Date(),
    })
    .where(eq(traders.id, traderId));
}

/**
 * Activate trader
 */
export async function activateTrader(traderId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(traders)
    .set({
      traderStatus: "active",
      challengeStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(traders.id, traderId));
}

/**
 * Get challenge countdown information
 */
export function getChallengeCountdown(challengeStartDate: Date, tradingDaysLimit: number): {
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  percentageComplete: number;
} {
  // Calculate challenge end date (start + trading days limit)
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const challengeEndDate = new Date(challengeStartDate.getTime() + tradingDaysLimit * millisecondsPerDay);

  const now = new Date();
  const timeRemaining = challengeEndDate.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      percentageComplete: 100,
    };
  }

  const daysRemaining = Math.floor(timeRemaining / millisecondsPerDay);
  const hoursRemaining = Math.floor((timeRemaining % millisecondsPerDay) / (60 * 60 * 1000));
  const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
  const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000);

  const totalMilliseconds = challengeEndDate.getTime() - challengeStartDate.getTime();
  const elapsedMilliseconds = now.getTime() - challengeStartDate.getTime();
  const percentageComplete = Math.round((elapsedMilliseconds / totalMilliseconds) * 100);

  return {
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    percentageComplete,
  };
}
