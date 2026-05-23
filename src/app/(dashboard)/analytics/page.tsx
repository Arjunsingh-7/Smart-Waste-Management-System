"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Package, Activity, Calendar } from "lucide-react";
import { toast } from "sonner";
import { usePlan } from "@/lib/hooks/usePlan";

interface AnalyticsSummary {
  totalWasteKg: number;
  avgFillLevel: number;
  totalCollections: number;
  daysTracked: number;
}

interface DailyAnalytics {
  date: string;
  wasteCollectedKg: string;
  fillLevelAvg: number;
  collectionsCount: number;
}

interface Dustbin {
  id: number;
  name: string;
  type: string;
  fillLevel: number;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const { plan, limits, planLoading } = usePlan();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) fetchAnalytics();
  }, [session]);

  const fetchAnalytics = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all analytics data in parallel for better performance
      const [summaryRes, dailyRes, dustbinsRes] = await Promise.all([
        fetch(`/api/analytics/summary?user_id=${session.user.id}`, { headers }),
        fetch("/api/analytics", { headers }),
        fetch("/api/dustbins?is_active=1", { headers }),
      ]);

      // Process responses with proper error handling
      const results = await Promise.allSettled([
        summaryRes.ok ? summaryRes.json() : null,
        dailyRes.ok ? dailyRes.json() : [],
        dustbinsRes.ok ? dustbinsRes.json() : []
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setSummary(results[0].value);
      }
      if (results[1].status === 'fulfilled') {
        setDailyData(results[1].value);
      }
      if (results[2].status === 'fulfilled') {
        setDustbins(results[2].value);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Memoize expensive chart data calculations
  // NOTE: hooks must be called unconditionally above any early returns
  const chartData = useMemo(() => {
    if (!dailyData || !dustbins) {
      return { wasteOverTimeData: [], collectionsData: [], binTypeData: [], fillLevelDistribution: [] };
    }

    const wasteOverTimeData = dailyData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      waste: parseFloat(item.wasteCollectedKg),
      fillLevel: item.fillLevelAvg,
    })).reverse();

    const collectionsData = dailyData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      collections: item.collectionsCount,
    })).reverse();

    const binTypeData = [
      { name: "Wet Bins", value: dustbins.filter(b => b.type === "wet").length },
      { name: "Dry Bins", value: dustbins.filter(b => b.type === "dry").length },
    ];

    const fillLevelDistribution = [
      { name: "Empty (0-25%)", value: dustbins.filter(b => b.fillLevel < 25).length },
      { name: "Quarter (25-50%)", value: dustbins.filter(b => b.fillLevel >= 25 && b.fillLevel < 50).length },
      { name: "Half (50-75%)", value: dustbins.filter(b => b.fillLevel >= 50 && b.fillLevel < 75).length },
      { name: "Full (75-100%)", value: dustbins.filter(b => b.fillLevel >= 75).length },
    ];

    return { wasteOverTimeData, collectionsData, binTypeData, fillLevelDistribution };
  }, [dailyData, dustbins]);

  if (loading || planLoading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const { wasteOverTimeData, collectionsData, binTypeData, fillLevelDistribution } = chartData;

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];
  const TYPE_COLORS = ["#22c55e", "#3b82f6"];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Waste Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your waste management performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste Collected</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalWasteKg.toFixed(1) || 0} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Last {summary?.daysTracked || 0} days</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fill Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.avgFillLevel.toFixed(0) || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all bins</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalCollections || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful pickups</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary && summary.daysTracked > 0
                ? (summary.totalWasteKg / summary.daysTracked).toFixed(1)
                : 0} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per day collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Waste Collection Trend</CardTitle>
            <CardDescription>Daily waste collected over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="waste" fill="#22c55e" name="Waste (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Average Fill Level Trend</CardTitle>
            <CardDescription>Daily average fill percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wasteOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fillLevel" stroke="#3b82f6" name="Fill Level (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Collections Over Time</CardTitle>
            <CardDescription>Number of daily collections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collections" fill="#f59e0b" name="Collections" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Bin Type Distribution</CardTitle>
            <CardDescription>Wet vs Dry waste bins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={binTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {binTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Current Fill Level Distribution</CardTitle>
          <CardDescription>Breakdown of bins by fill level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fillLevelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Number of Bins">
                {fillLevelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
