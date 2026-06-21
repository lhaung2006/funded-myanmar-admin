import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Plus, Edit2, LogOut, Loader2, CheckCircle2, Save, Upload } from "lucide-react";

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
}

interface Trader {
  id: number;
  traderName: string;
  email: string;
  accountNumber: string;
  challengeStatus: "active" | "passed" | "failed";
  metrics?: TradingMetrics;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingMT5, setUploadingMT5] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    traderName: "",
    email: "",
    accountNumber: "",
    balance: 1000000,
    equity: 1000000,
    profitTarget: 100000,
    dailyDrawdown: 0,
    dailyDrawdownLimit: 50000,
    maxDrawdown: 0,
    maxDrawdownLimit: 100000,
    tradingDaysUsed: 0,
    tradingDaysLimit: 30,
    winRate: 0,
    totalTrades: 0,
    challengeStatus: "active" as const,
  });

  useEffect(() => {
    fetchTraders();
  }, []);

  const fetchTraders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/traders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLocation("/admin/login");
          return;
        }
        throw new Error("Failed to fetch traders");
      }

      const data = await response.json();
      setTraders(data);
      if (data.length > 0) {
        setSelectedTrader(data[0]);
        loadTraderMetrics(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadTraderMetrics = async (traderId: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${traderId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load metrics");

      const metrics = await response.json();
      setFormData((prev) => ({
        ...prev,
        ...metrics,
        balance: metrics.balance,
        equity: metrics.equity,
        profitTarget: metrics.profitTarget,
        dailyDrawdown: metrics.dailyDrawdown,
        dailyDrawdownLimit: metrics.dailyDrawdownLimit,
        maxDrawdown: metrics.maxDrawdown,
        maxDrawdownLimit: metrics.maxDrawdownLimit,
        tradingDaysUsed: metrics.tradingDaysUsed,
        tradingDaysLimit: metrics.tradingDaysLimit,
        winRate: metrics.winRate,
        totalTrades: metrics.totalTrades,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    }
  };

  const handleSelectTrader = (trader: Trader) => {
    setSelectedTrader(trader);
    loadTraderMetrics(trader.id);
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Status") ? value : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveMetrics = async () => {
    if (!selectedTrader) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${selectedTrader.id}/metrics`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          balance: formData.balance,
          equity: formData.equity,
          profitTarget: formData.profitTarget,
          dailyDrawdown: formData.dailyDrawdown,
          dailyDrawdownLimit: formData.dailyDrawdownLimit,
          maxDrawdown: formData.maxDrawdown,
          maxDrawdownLimit: formData.maxDrawdownLimit,
          tradingDaysUsed: formData.tradingDaysUsed,
          tradingDaysLimit: formData.tradingDaysLimit,
          winRate: formData.winRate,
          totalTrades: formData.totalTrades,
          challengeStatus: formData.challengeStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to save metrics");

      setSuccess("Metrics updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      fetchTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metrics");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTrader = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/traders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          traderName: formData.traderName,
          email: formData.email,
          accountNumber: formData.accountNumber,
          balance: formData.balance,
          equity: formData.equity,
          profitTarget: formData.profitTarget,
          dailyDrawdownLimit: formData.dailyDrawdownLimit,
          maxDrawdownLimit: formData.maxDrawdownLimit,
          tradingDaysLimit: formData.tradingDaysLimit,
        }),
      });

      if (!response.ok) throw new Error("Failed to create trader");

      setSuccess("Trader created successfully!");
      setShowCreateForm(false);
      setFormData({
        traderName: "",
        email: "",
        accountNumber: "",
        balance: 1000000,
        equity: 1000000,
        profitTarget: 100000,
        dailyDrawdown: 0,
        dailyDrawdownLimit: 50000,
        maxDrawdown: 0,
        maxDrawdownLimit: 100000,
        tradingDaysUsed: 0,
        tradingDaysLimit: 30,
        winRate: 0,
        totalTrades: 0,
        challengeStatus: "active",
      });
      fetchTraders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trader");
    } finally {
      setSaving(false);
    }
  };

  const handleResetChallenge = async () => {
    if (!selectedTrader) return;
    if (!window.confirm("Are you sure you want to reset this trader's challenge?")) return;

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${selectedTrader.id}/reset-challenge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to reset challenge");
      setSuccess("Challenge reset successfully!");
      fetchTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset challenge");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendTrader = async () => {
    if (!selectedTrader) return;
    if (!window.confirm("Are you sure you want to suspend this trader?")) return;

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${selectedTrader.id}/suspend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to suspend trader");
      setSuccess("Trader suspended successfully!");
      fetchTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend trader");
    } finally {
      setSaving(false);
    }
  };

  const handleActivateTrader = async () => {
    if (!selectedTrader) return;

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${selectedTrader.id}/activate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to activate trader");
      setSuccess("Trader activated successfully!");
      fetchTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate trader");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrader = async () => {
    if (!selectedTrader) return;
    if (!window.confirm("Are you sure you want to delete this trader? This action cannot be undone.")) return;

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/trader/${selectedTrader.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete trader");
      setSuccess("Trader deleted successfully!");
      setSelectedTrader(null);
      fetchTraders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trader");
    } finally {
      setSaving(false);
    }
  };

  const handleMT5Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["text/html", "text/csv", "application/vnd.ms-excel"];
    const fileName = file.name.toLowerCase();
    const isValidType =
      validTypes.some((type) => file.type === type) ||
      fileName.endsWith(".html") ||
      fileName.endsWith(".csv");

    if (!isValidType) {
      setError("Invalid file type. Please upload an .html or .csv MT5 report.");
      return;
    }

    try {
      setUploadingMT5(true);
      setError(null);

      const fileContent = await file.text();

      setSuccess(`MT5 Report uploaded: ${file.name}`);
      setTimeout(() => setSuccess(null), 3000);

      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload MT5 report");
    } finally {
      setUploadingMT5(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Funded Myanmar</h1>
            <p className="text-sm text-slate-400">Admin Control Panel</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-600 hover:bg-slate-800">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4 border-red-500/50 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-100">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500/50 bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-100">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Traders Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Traders</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="border-green-600 text-green-400 hover:bg-green-900/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <label>
                      <input
                        type="file"
                        accept=".html,.csv"
                        onChange={handleMT5Upload}
                        disabled={uploadingMT5}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={uploadingMT5}
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/20 cursor-pointer"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement);
                          input?.click();
                        }}
                      >
                        {uploadingMT5 ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                    </label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {traders.map((trader) => (
                  <button
                    key={trader.id}
                    onClick={() => handleSelectTrader(trader)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTrader?.id === trader.id
                        ? "bg-green-600/20 border border-green-500/50"
                        : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <p className="font-semibold text-white text-sm">{trader.traderName}</p>
                    <p className="text-xs text-slate-400">{trader.accountNumber}</p>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        trader.challengeStatus === "passed"
                          ? "text-green-400"
                          : trader.challengeStatus === "failed"
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {trader.challengeStatus.toUpperCase()}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showCreateForm ? (
              <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Create New Trader Account</CardTitle>
                  <CardDescription>Add a new trader to the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Trader Name</label>
                      <Input
                        name="traderName"
                        value={formData.traderName}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="trader@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Account Number</label>
                      <Input
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="ACC-001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Initial Balance ($)</label>
                      <Input
                        name="balance"
                        type="number"
                        value={formData.balance / 100}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            balance: Number(e.target.value) * 100,
                          }))
                        }
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Profit Target ($)</label>
                      <Input
                        name="profitTarget"
                        type="number"
                        value={formData.profitTarget / 100}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            profitTarget: Number(e.target.value) * 100,
                          }))
                        }
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Daily Drawdown Limit ($)</label>
                      <Input
                        name="dailyDrawdownLimit"
                        type="number"
                        value={formData.dailyDrawdownLimit / 100}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dailyDrawdownLimit: Number(e.target.value) * 100,
                          }))
                        }
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Max Drawdown Limit ($)</label>
                      <Input
                        name="maxDrawdownLimit"
                        type="number"
                        value={formData.maxDrawdownLimit / 100}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxDrawdownLimit: Number(e.target.value) * 100,
                          }))
                        }
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Trading Days Limit</label>
                      <Input
                        name="tradingDaysLimit"
                        type="number"
                        value={formData.tradingDaysLimit}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 text-white mt-1"
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateTrader}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Trader
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(false)}
                      variant="outline"
                      className="border-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedTrader ? (
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
                  <TabsTrigger value="metrics" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
                    Trading Metrics
                  </TabsTrigger>
                  <TabsTrigger value="details" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
                    Account Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                  <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-green-400" />
                        Update Trading Metrics
                      </CardTitle>
                      <CardDescription>Modify trader performance data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Balance & Equity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Balance ($)</label>
                          <Input
                            name="balance"
                            type="number"
                            value={formData.balance / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                balance: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300">Current Equity ($)</label>
                          <Input
                            name="equity"
                            type="number"
                            value={formData.equity / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                equity: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                      </div>

                      {/* Profit Target */}
                      <div>
                        <label className="text-sm font-medium text-slate-300">Profit Target ($)</label>
                        <Input
                          name="profitTarget"
                          type="number"
                          value={formData.profitTarget / 100}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              profitTarget: Number(e.target.value) * 100,
                            }))
                          }
                          className="bg-slate-800 border-slate-600 text-white mt-1"
                        />
                      </div>

                      {/* Drawdown Limits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Daily Drawdown ($)</label>
                          <Input
                            name="dailyDrawdown"
                            type="number"
                            value={formData.dailyDrawdown / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dailyDrawdown: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300">Daily Drawdown Limit ($)</label>
                          <Input
                            name="dailyDrawdownLimit"
                            type="number"
                            value={formData.dailyDrawdownLimit / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dailyDrawdownLimit: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Max Drawdown ($)</label>
                          <Input
                            name="maxDrawdown"
                            type="number"
                            value={formData.maxDrawdown / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxDrawdown: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300">Max Drawdown Limit ($)</label>
                          <Input
                            name="maxDrawdownLimit"
                            type="number"
                            value={formData.maxDrawdownLimit / 100}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxDrawdownLimit: Number(e.target.value) * 100,
                              }))
                            }
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                      </div>

                      {/* Trading Days & Performance */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Trading Days Used</label>
                          <Input
                            name="tradingDaysUsed"
                            type="number"
                            value={formData.tradingDaysUsed}
                            onChange={handleInputChange}
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300">Trading Days Limit</label>
                          <Input
                            name="tradingDaysLimit"
                            type="number"
                            value={formData.tradingDaysLimit}
                            onChange={handleInputChange}
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300">Win Rate (%)</label>
                          <Input
                            name="winRate"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.winRate}
                            onChange={handleInputChange}
                            className="bg-slate-800 border-slate-600 text-white mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300">Total Trades</label>
                        <Input
                          name="totalTrades"
                          type="number"
                          value={formData.totalTrades}
                          onChange={handleInputChange}
                          className="bg-slate-800 border-slate-600 text-white mt-1"
                        />
                      </div>

                      {/* Challenge Status */}
                      <div>
                        <label className="text-sm font-medium text-slate-300">Challenge Status</label>
                        <Select
                          value={formData.challengeStatus}
                          onValueChange={(value) =>
                            handleSelectChange("challengeStatus", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="active" className="text-white">
                              Active
                            </SelectItem>
                            <SelectItem value="passed" className="text-white">
                              Passed
                            </SelectItem>
                            <SelectItem value="failed" className="text-white">
                              Failed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleSaveMetrics}
                        disabled={saving}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details">
                  <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Trader Name</p>
                          <p className="text-white font-semibold">{selectedTrader.traderName}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Email</p>
                          <p className="text-white font-mono text-sm">{selectedTrader.email}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Account Number</p>
                          <p className="text-white font-mono font-semibold">{selectedTrader.accountNumber}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Current Status</p>
                          <p
                            className={`font-semibold capitalize ${
                              selectedTrader.challengeStatus === "passed"
                                ? "text-green-400"
                                : selectedTrader.challengeStatus === "failed"
                                ? "text-red-400"
                                : "text-blue-400"
                            }`}
                          >
                            {selectedTrader.challengeStatus}
                          </p>
                        </div>
                      </div>

                      {/* Trader Management Actions */}
                      <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-white font-semibold mb-4">Trader Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button
                            onClick={handleResetChallenge}
                            disabled={saving}
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                          >
                            Reset Challenge
                          </Button>
                          <Button
                            onClick={handleSuspendTrader}
                            disabled={saving}
                            variant="outline"
                            className="border-orange-600 text-orange-400 hover:bg-orange-900/20"
                          >
                            Suspend Trader
                          </Button>
                          <Button
                            onClick={handleActivateTrader}
                            disabled={saving}
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-900/20"
                          >
                            Activate Trader
                          </Button>
                          <Button
                            onClick={handleDeleteTrader}
                            disabled={saving}
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            Delete Trader
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-slate-400 text-center">Select a trader or create a new one to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
