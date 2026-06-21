/**
 * In-memory storage for traders and trading metrics
 * No database required - all data stored in memory
 */

interface Trader {
  id: number;
  traderName: string;
  email: string;
  accountNumber: string;
  challengeStatus: "active" | "passed" | "failed" | "suspended";
  traderStatus: "active" | "suspended" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface TradingMetrics {
  id: number;
  traderId: number;
  balance: number;
  equity: number;
  profitTarget: number;
  dailyDrawdown: number;
  dailyDrawdownLimit: number;
  maxDrawdown: number;
  maxDrawdownLimit: number;
  tradingDaysUsed: number;
  tradingDaysLimit: number;
  winRate: number;
  totalTrades: number;
  challengeStartDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ChallengeRule {
  id: number;
  traderId: number;
  accountSize: number;
  profitTarget: number;
  dailyDrawdownLimit: number;
  maxDrawdownLimit: number;
  minTradingDays: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let traders: Trader[] = [
  {
    id: 1,
    traderName: "Sai Myat Aung",
    email: "sai@fundedmyammer.com",
    accountNumber: "ACC-001",
    challengeStatus: "active",
    traderStatus: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let metrics: TradingMetrics[] = [
  {
    id: 1,
    traderId: 1,
    balance: 10500,
    equity: 10750,
    profitTarget: 1000,
    dailyDrawdown: -250,
    dailyDrawdownLimit: -500,
    maxDrawdown: -400,
    maxDrawdownLimit: -1000,
    tradingDaysUsed: 5,
    tradingDaysLimit: 30,
    winRate: 65,
    totalTrades: 20,
    challengeStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let challengeRules: ChallengeRule[] = [
  {
    id: 1,
    traderId: 1,
    accountSize: 10000,
    profitTarget: 1000,
    dailyDrawdownLimit: -500,
    maxDrawdownLimit: -1000,
    minTradingDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextTraderId = 2;
let nextMetricsId = 2;
let nextChallengeRuleId = 2;

// Trader operations
export function getAllTraders(): Trader[] {
  return traders;
}

export function getTraderById(id: number): Trader | undefined {
  return traders.find((t) => t.id === id);
}

export function getTraderByAccountNumber(accountNumber: string): Trader | undefined {
  return traders.find((t) => t.accountNumber === accountNumber);
}

export function getTraderByName(name: string): Trader | undefined {
  return traders.find((t) => t.traderName === name);
}

export function createTrader(trader: Omit<Trader, "id" | "createdAt" | "updatedAt">): Trader {
  const newTrader: Trader = {
    ...trader,
    id: nextTraderId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  traders.push(newTrader);
  return newTrader;
}

export function updateTrader(id: number, updates: Partial<Trader>): Trader | undefined {
  const trader = traders.find((t) => t.id === id);
  if (!trader) return undefined;

  const updated = {
    ...trader,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const index = traders.findIndex((t) => t.id === id);
  traders[index] = updated;
  return updated;
}

export function deleteTrader(id: number): boolean {
  const index = traders.findIndex((t) => t.id === id);
  if (index === -1) return false;
  traders.splice(index, 1);
  return true;
}

// Metrics operations
export function getMetricsByTraderId(traderId: number): TradingMetrics | undefined {
  return metrics.find((m) => m.traderId === traderId);
}

export function upsertMetrics(traderId: number, updates: Partial<TradingMetrics>): TradingMetrics {
  let metric = metrics.find((m) => m.traderId === traderId);

  if (!metric) {
    metric = {
      id: nextMetricsId++,
      traderId,
      balance: 0,
      equity: 0,
      profitTarget: 0,
      dailyDrawdown: 0,
      dailyDrawdownLimit: 0,
      maxDrawdown: 0,
      maxDrawdownLimit: 0,
      tradingDaysUsed: 0,
      tradingDaysLimit: 0,
      winRate: 0,
      totalTrades: 0,
      challengeStartDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    metrics.push(metric);
  } else {
    metric = {
      ...metric,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const index = metrics.findIndex((m) => m.traderId === traderId);
    metrics[index] = metric;
  }

  return metric;
}

// Challenge rules operations
export function getChallengeRulesByTraderId(traderId: number): ChallengeRule | undefined {
  return challengeRules.find((r) => r.traderId === traderId);
}

export function upsertChallengeRules(traderId: number, updates: Partial<ChallengeRule>): ChallengeRule {
  let rule = challengeRules.find((r) => r.traderId === traderId);

  if (!rule) {
    rule = {
      id: nextChallengeRuleId++,
      traderId,
      accountSize: 0,
      profitTarget: 0,
      dailyDrawdownLimit: 0,
      maxDrawdownLimit: 0,
      minTradingDays: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    challengeRules.push(rule);
  } else {
    rule = {
      ...rule,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const index = challengeRules.findIndex((r) => r.traderId === traderId);
    challengeRules[index] = rule;
  }

  return rule;
}

export function deleteChallengeRules(traderId: number): boolean {
  const index = challengeRules.findIndex((r) => r.traderId === traderId);
  if (index === -1) return false;
  challengeRules.splice(index, 1);
  return true;
}
