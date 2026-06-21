import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Traders table - stores trader account information
 */
export const traders = mysqlTable("traders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  traderName: varchar("traderName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  accountNumber: varchar("accountNumber", { length: 64 }).notNull().unique(),
  challengeStatus: mysqlEnum("challengeStatus", ["active", "passed", "failed", "suspended"]).default("active").notNull(),
  traderStatus: mysqlEnum("traderStatus", ["active", "suspended", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trader = typeof traders.$inferSelect;
export type InsertTrader = typeof traders.$inferInsert;

/**
 * Trading metrics table - stores all trading performance data
 */
export const tradingMetrics = mysqlTable("tradingMetrics", {
  id: int("id").autoincrement().primaryKey(),
  traderId: int("traderId").notNull(),
  balance: int("balance").default(0).notNull(), // in cents/smallest unit
  equity: int("equity").default(0).notNull(), // in cents/smallest unit
  profitTarget: int("profitTarget").default(0).notNull(), // in cents/smallest unit
  dailyDrawdown: int("dailyDrawdown").default(0).notNull(), // in cents/smallest unit
  dailyDrawdownLimit: int("dailyDrawdownLimit").default(0).notNull(), // in cents/smallest unit
  maxDrawdown: int("maxDrawdown").default(0).notNull(), // in cents/smallest unit
  maxDrawdownLimit: int("maxDrawdownLimit").default(0).notNull(), // in cents/smallest unit
  tradingDaysUsed: int("tradingDaysUsed").default(0).notNull(),
  tradingDaysLimit: int("tradingDaysLimit").default(0).notNull(),
  winRate: int("winRate").default(0).notNull(), // in percentage (0-100)
  totalTrades: int("totalTrades").default(0).notNull(),
  challengeStartDate: timestamp("challengeStartDate").defaultNow().notNull(),
  challengeEndDate: timestamp("challengeEndDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradingMetric = typeof tradingMetrics.$inferSelect;
export type InsertTradingMetric = typeof tradingMetrics.$inferInsert;

/**
 * Admin logs table - audit trail for admin actions
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  traderId: int("traderId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  changes: text("changes"), // JSON string of what changed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * Challenge rules table - stores challenge configuration and rules
 */
export const challengeRules = mysqlTable("challengeRules", {
  id: int("id").autoincrement().primaryKey(),
  traderId: int("traderId").notNull(),
  accountSize: int("accountSize").default(0).notNull(), // in cents
  profitTarget: int("profitTarget").default(0).notNull(), // in cents
  dailyDrawdownLimit: int("dailyDrawdownLimit").default(0).notNull(), // in cents
  maxDrawdownLimit: int("maxDrawdownLimit").default(0).notNull(), // in cents
  minTradingDays: int("minTradingDays").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeRule = typeof challengeRules.$inferSelect;
export type InsertChallengeRule = typeof challengeRules.$inferInsert;

/**
 * Trade history table - stores individual trades for analytics
 */
export const tradeHistory = mysqlTable("tradeHistory", {
  id: int("id").autoincrement().primaryKey(),
  traderId: int("traderId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  entryPrice: int("entryPrice").notNull(), // in cents
  exitPrice: int("exitPrice").notNull(), // in cents
  quantity: int("quantity").notNull(),
  profitLoss: int("profitLoss").notNull(), // in cents
  isWin: int("isWin").default(0).notNull(), // 0 or 1 (boolean)
  tradeDate: timestamp("tradeDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = typeof tradeHistory.$inferInsert;
