import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lock, BarChart3, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Funded Myanmar</h1>
              <p className="text-sm text-slate-400">Trading Challenge Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Professional Trading Challenges
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join Funded Myanmar and get funded to trade. Real money, real opportunities, real results.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:border-green-500/50 transition-all">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Real Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Trade real accounts with real capital. Prove your skills and get funded.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:border-green-500/50 transition-all">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Live Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Track your performance in real-time with detailed analytics and metrics.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:border-green-500/50 transition-all">
            <CardHeader>
              <Lock className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Enterprise-grade security with JWT authentication and encrypted data.</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trader CTA */}
          <Card className="border-green-500/50 bg-gradient-to-br from-green-900/20 to-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Trader Dashboard
              </CardTitle>
              <CardDescription>View your trading performance and challenge progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Access your live trading dashboard to monitor:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Account balance and equity
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Profit target progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Drawdown limits and usage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Win rate and trading statistics
                </li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                <a href="/trader/login" className="w-full">
                  Trader Login
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Admin CTA */}
          <Card className="border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Admin Panel
              </CardTitle>
              <CardDescription>Manage traders and trading metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Secure admin access to:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Create and manage trader accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Update trading metrics in real-time
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Manage challenge status
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  View audit logs and changes
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                <a href="/admin/login" className="w-full">
                  Admin Login
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-700/50 text-center">
          <p className="text-slate-500 text-sm">
            Funded Myanmar © 2026. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Demo Admin: Linn Htet Aung / lhaung2006 | Demo Trader: Sai Myat Aung / smaung2006
          </p>
        </div>
      </div>
    </div>
  );
}
