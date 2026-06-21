import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  challengeEndDate: string | null;
}

interface Trader {
  id: number;
  traderName: string;
  email: string;
  accountNumber: string;
  challengeStatus: "active" | "passed" | "failed";
}

export default function TraderDashboard() {
  const [location, setLocation] = useLocation();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [metrics, setMetrics] = useState<TradingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    // Check if trader is logged in
    const token = localStorage.getItem("traderToken");
    if (!token) {
      setLocation("/trader/login");
      return;
    }
    fetchTraderData();
  }, [setLocation]);

  useEffect(() => {
    if (!metrics) return;
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);
    return () => clearInterval(timer);
  }, [metrics]);

  const fetchTraderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("traderToken");
      const response = await fetch("/api/trader/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("traderToken");
        setLocation("/trader/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch trader data");
      const data = await response.json();
      setTrader(data.trader);
      setMetrics(data.metrics);
      updateCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!metrics) return;
    const endDate = new Date(metrics.challengeEndDate || metrics.challengeStartDate);
    endDate.setDate(endDate.getDate() + 30); // Assuming 30-day challenge
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeLeft("Challenge Ended");
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-900/20 border-green-500/50 text-green-100";
      case "failed":
        return "bg-red-900/20 border-red-500/50 text-red-100";
      default:
        return "bg-blue-900/20 border-blue-500/50 text-blue-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "failed":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const getProgressPercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  if (loading && !trader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Loading...</CardTitle>
            <CardDescription>Fetching your trading dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !trader || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-6xl mx-auto">
          <Alert className="border-red-500/50 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-100">
              {error || "Failed to load trader data"}
            </AlertDescription>
          </Alert>
          <Button onClick={fetchTraderData} className="mt-4 bg-green-600 hover:bg-green-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const profitProgress = getProgressPercentage(metrics.equity - 10000, metrics.profitTarget);
  const dailyDrawdownProgress = getProgressPercentage(Math.abs(metrics.dailyDrawdown), metrics.dailyDrawdownLimit);
  const maxDrawdownProgress = getProgressPercentage(Math.abs(metrics.maxDrawdown), metrics.maxDrawdownLimit);
  const tradingDaysProgress = getProgressPercentage(metrics.tradingDaysUsed, metrics.tradingDaysLimit);

  // Calculate remaining amounts
  const remainingProfitTarget = Math.max(0, metrics.profitTarget - (metrics.equity - 10000));
  const remainingDailyDrawdown = Math.max(0, metrics.dailyDrawdownLimit - Math.abs(metrics.dailyDrawdown));
  const remainingMaxDrawdown = Math.max(0, metrics.maxDrawdownLimit - Math.abs(metrics.maxDrawdown));
  const challengeProgressPercentage = Math.round((metrics.tradingDaysUsed / metrics.tradingDaysLimit) * 100);
  const profitFactor = metrics.totalTrades > 0 ? (metrics.winRate / (100 - metrics.winRate) || 0).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Funded Myanmar</h1>
            <p className="text-sm text-slate-400">Trading Challenge Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Trader</p>
              <p className="text-white font-semibold">{trader.traderName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("traderToken");
                localStorage.removeItem("traderUsername");
                setLocation("/trader/login");
              }}
              className="border-slate-600 hover:bg-slate-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className={`rounded-lg border-2 p-6 mb-8 flex items-center justify-between ${getStatusColor(trader.challengeStatus)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(trader.challengeStatus)}
            <div>
              <h2 className="font-bold text-lg capitalize">{trader.challengeStatus} Challenge</h2>
              <p className="text-sm opacity-90">Account: {trader.accountNumber}</p>
            </div>
          </div>
          {trader.challengeStatus === "active" && (
            <div className="text-right">
              <p className="text-xs opacity-75">Time Remaining</p>
              <p className="text-2xl font-bold">{timeLeft}</p>
            </div>
          )}
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Balance Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{formatCurrency(metrics.balance)}</div>
              <p className="text-xs text-slate-500 mt-1">Starting: $10,000</p>
            </CardContent>
          </Card>

          {/* Equity Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Current Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{formatCurrency(metrics.equity)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics.equity >= 10000 ? "+" : ""}{formatCurrency(metrics.equity - 10000)}
              </p>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{metrics.winRate}%</div>
              <p className="text-xs text-slate-500 mt-1">{metrics.totalTrades} total trades</p>
              <p className="text-xs text-slate-500 mt-2">Profit Factor: {profitFactor}</p>
            </CardContent>
          </Card>

          {/* Trading Days Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-400" />
                Trading Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{metrics.tradingDaysUsed}/{metrics.tradingDaysLimit}</div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${tradingDaysProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profit Target Progress */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Profit Target
              </CardTitle>
              <CardDescription>Progress towards challenge goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current P&L</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(metrics.equity - 10000)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all"
                    style={{ width: `${profitProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Target: {formatCurrency(metrics.profitTarget)}</span>
                  <span>{Math.round(profitProgress)}%</span>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Remaining: {formatCurrency(remainingProfitTarget)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Challenge Progress</div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Days Used</span>
                  <span className="text-blue-400 font-semibold">{metrics.tradingDaysUsed}/{metrics.tradingDaysLimit}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${challengeProgressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drawdown Tracking */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-400" />
                Drawdown Limits
              </CardTitle>
              <CardDescription>Monitor your risk exposure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Drawdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Daily Drawdown</span>
                  <span className={metrics.dailyDrawdown < 0 ? "text-red-400" : "text-green-400"}>
                    {formatCurrency(Math.abs(metrics.dailyDrawdown))} / {formatCurrency(metrics.dailyDrawdownLimit)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      dailyDrawdownProgress > 80 ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${dailyDrawdownProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Remaining: {formatCurrency(remainingDailyDrawdown)}
                </div>
              </div>

              {/* Max Drawdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Max Drawdown</span>
                  <span className={metrics.maxDrawdown < 0 ? "text-red-400" : "text-green-400"}>
                    {formatCurrency(Math.abs(metrics.maxDrawdown))} / {formatCurrency(metrics.maxDrawdownLimit)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      maxDrawdownProgress > 80 ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${maxDrawdownProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Remaining: {formatCurrency(remainingMaxDrawdown)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Details */}
        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Challenge Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Account Number</p>
                <p className="text-white font-mono font-semibold">{trader.accountNumber}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-white text-sm">{trader.email}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Challenge Start</p>
                <p className="text-white text-sm">{new Date(metrics.challengeStartDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <p className={`text-sm font-semibold capitalize ${
                  trader.challengeStatus === "passed" ? "text-green-400" :
                  trader.challengeStatus === "failed" ? "text-red-400" : "text-blue-400"
                }`}>
                  {trader.challengeStatus}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
