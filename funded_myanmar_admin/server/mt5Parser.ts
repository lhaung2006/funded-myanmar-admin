/**
 * MT5 Report Parser
 * Parses MT5 HTML and CSV reports to extract trading metrics
 */

export interface ParsedMetrics {
  netProfit: number;
  winRate: number;
  totalTrades: number;
  averageRiskReward: number;
  dailyDrawdown: number;
  maxDrawdown: number;
  balance: number;
  equity: number;
  profitFactor: number;
  winningTrades: number;
  losingTrades: number;
}

/**
 * Parse MT5 HTML Report
 */
export function parseHtmlReport(htmlContent: string): ParsedMetrics {
  try {
    // Extract data from HTML tables
    const metrics: ParsedMetrics = {
      netProfit: 0,
      winRate: 0,
      totalTrades: 0,
      averageRiskReward: 0,
      dailyDrawdown: 0,
      maxDrawdown: 0,
      balance: 0,
      equity: 0,
      profitFactor: 0,
      winningTrades: 0,
      losingTrades: 0,
    };

    // Extract Net Profit
    const netProfitMatch = htmlContent.match(/Net\s+Profit[:\s]*([^<\n]*)/i);
    if (netProfitMatch) {
      metrics.netProfit = parseFloat(netProfitMatch[1].replace(/[^\d.-]/g, "")) || 0;
    }

    // Extract Total Trades
    const totalTradesMatch = htmlContent.match(/Total\s+Trades[:\s]*(\d+)/i);
    if (totalTradesMatch) {
      metrics.totalTrades = parseInt(totalTradesMatch[1]) || 0;
    }

    // Extract Winning Trades
    const winningTradesMatch = htmlContent.match(/Winning\s+Trades[:\s]*(\d+)/i);
    if (winningTradesMatch) {
      metrics.winningTrades = parseInt(winningTradesMatch[1]) || 0;
    }

    // Extract Losing Trades
    const losingTradesMatch = htmlContent.match(/Losing\s+Trades[:\s]*(\d+)/i);
    if (losingTradesMatch) {
      metrics.losingTrades = parseInt(losingTradesMatch[1]) || 0;
    }

    // Calculate Win Rate
    if (metrics.totalTrades > 0) {
      metrics.winRate = (metrics.winningTrades / metrics.totalTrades) * 100;
    }

    // Extract Profit Factor
    const profitFactorMatch = htmlContent.match(/Profit\s+Factor[:\s]*([^<\n]*)/i);
    if (profitFactorMatch) {
      metrics.profitFactor = parseFloat(profitFactorMatch[1].replace(/[^\d.-]/g, "")) || 0;
    }

    // Extract Max Drawdown
    const maxDrawdownMatch = htmlContent.match(/Max\s+Drawdown[:\s]*([^<\n%]*)/i);
    if (maxDrawdownMatch) {
      const drawdownStr = maxDrawdownMatch[1].replace(/[^\d.-]/g, "");
      metrics.maxDrawdown = Math.abs(parseFloat(drawdownStr)) || 0;
    }

    // Extract Daily Drawdown
    const dailyDrawdownMatch = htmlContent.match(/Daily\s+Drawdown[:\s]*([^<\n%]*)/i);
    if (dailyDrawdownMatch) {
      const drawdownStr = dailyDrawdownMatch[1].replace(/[^\d.-]/g, "");
      metrics.dailyDrawdown = Math.abs(parseFloat(drawdownStr)) || 0;
    }

    // Extract Balance
    const balanceMatch = htmlContent.match(/Balance[:\s]*([^<\n]*)/i);
    if (balanceMatch) {
      metrics.balance = parseFloat(balanceMatch[1].replace(/[^\d.-]/g, "")) || 0;
    }

    // Extract Equity
    const equityMatch = htmlContent.match(/Equity[:\s]*([^<\n]*)/i);
    if (equityMatch) {
      metrics.equity = parseFloat(equityMatch[1].replace(/[^\d.-]/g, "")) || 0;
    }

    // Calculate Average Risk Reward if profit factor exists
    if (metrics.profitFactor > 0) {
      metrics.averageRiskReward = metrics.profitFactor;
    }

    return metrics;
  } catch (error) {
    console.error("Error parsing HTML report:", error);
    throw new Error("Failed to parse HTML report");
  }
}

/**
 * Parse MT5 CSV Report
 */
export function parseCsvReport(csvContent: string): ParsedMetrics {
  try {
    const metrics: ParsedMetrics = {
      netProfit: 0,
      winRate: 0,
      totalTrades: 0,
      averageRiskReward: 0,
      dailyDrawdown: 0,
      maxDrawdown: 0,
      balance: 0,
      equity: 0,
      profitFactor: 0,
      winningTrades: 0,
      losingTrades: 0,
    };

    const lines = csvContent.split("\n");
    const trades: Array<{ profit: number; type: "win" | "loss" }> = [];

    // Parse CSV lines
    for (const line of lines) {
      if (!line.trim()) continue;

      const columns = line.split(",").map((col) => col.trim());

      // Look for profit column (usually contains profit/loss values)
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i].toLowerCase();

        // Extract metrics from header or data rows
        if (col.includes("net profit")) {
          const value = parseFloat(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.netProfit = value;
        }

        if (col.includes("total trades")) {
          const value = parseInt(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.totalTrades = value;
        }

        if (col.includes("winning trades")) {
          const value = parseInt(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.winningTrades = value;
        }

        if (col.includes("losing trades")) {
          const value = parseInt(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.losingTrades = value;
        }

        if (col.includes("profit factor")) {
          const value = parseFloat(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.profitFactor = value;
        }

        if (col.includes("max drawdown")) {
          const value = Math.abs(parseFloat(columns[i + 1] || "0"));
          if (!isNaN(value)) metrics.maxDrawdown = value;
        }

        if (col.includes("balance")) {
          const value = parseFloat(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.balance = value;
        }

        if (col.includes("equity")) {
          const value = parseFloat(columns[i + 1] || "0");
          if (!isNaN(value)) metrics.equity = value;
        }
      }

      // Try to extract individual trade data
      if (columns.length >= 3) {
        const profitValue = parseFloat(columns[columns.length - 1]);
        if (!isNaN(profitValue) && profitValue !== 0) {
          trades.push({
            profit: profitValue,
            type: profitValue > 0 ? "win" : "loss",
          });
        }
      }
    }

    // Calculate metrics from parsed trades
    if (trades.length > 0) {
      metrics.totalTrades = trades.length;
      metrics.winningTrades = trades.filter((t) => t.type === "win").length;
      metrics.losingTrades = trades.filter((t) => t.type === "loss").length;

      if (metrics.totalTrades > 0) {
        metrics.winRate = (metrics.winningTrades / metrics.totalTrades) * 100;
      }

      // Calculate net profit from trades
      metrics.netProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    }

    // Calculate Average Risk Reward
    if (metrics.profitFactor > 0) {
      metrics.averageRiskReward = metrics.profitFactor;
    }

    return metrics;
  } catch (error) {
    console.error("Error parsing CSV report:", error);
    throw new Error("Failed to parse CSV report");
  }
}

/**
 * Parse MT5 Report (auto-detect format)
 */
export function parseReport(fileContent: string, fileName: string): ParsedMetrics {
  const isHtml = fileName.toLowerCase().endsWith(".html") || fileContent.includes("<html");
  const isCsv = fileName.toLowerCase().endsWith(".csv") || fileContent.includes(",");

  if (isHtml) {
    return parseHtmlReport(fileContent);
  } else if (isCsv) {
    return parseCsvReport(fileContent);
  } else {
    // Try to detect format automatically
    if (fileContent.includes("<html") || fileContent.includes("<table")) {
      return parseHtmlReport(fileContent);
    } else if (fileContent.includes(",")) {
      return parseCsvReport(fileContent);
    } else {
      throw new Error("Unsupported report format. Please use HTML or CSV.");
    }
  }
}

/**
 * Validate parsed metrics
 */
export function validateMetrics(metrics: ParsedMetrics): string[] {
  const errors: string[] = [];

  if (metrics.totalTrades < 0) {
    errors.push("Total trades cannot be negative");
  }

  if (metrics.winRate < 0 || metrics.winRate > 100) {
    errors.push("Win rate must be between 0 and 100");
  }

  if (metrics.maxDrawdown < 0) {
    errors.push("Max drawdown cannot be negative");
  }

  if (metrics.dailyDrawdown < 0) {
    errors.push("Daily drawdown cannot be negative");
  }

  if (metrics.winningTrades + metrics.losingTrades !== metrics.totalTrades && metrics.totalTrades > 0) {
    errors.push("Winning trades + losing trades does not equal total trades");
  }

  return errors;
}
