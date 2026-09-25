"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { MapPin, List, Bell, TrendingUp, Trash2, AlertCircle, RefreshCw, X, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
const EnvironmentalImpactBanner = dynamic(() => import("@/components/dashboard/EnvironmentalImpactBanner"), {
  ssr: false,
  loading: () => <div className="h-36 bg-muted animate-pulse rounded-2xl" />,
});


const DustbinMap = dynamic(() => import("@/components/dashboard/DustbinMap"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-muted animate-pulse rounded-xl" />,
});

const DustbinList = dynamic(() => import("@/components/dashboard/DustbinList"), {
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-xl" />,
});

interface Dustbin {
  id: number;
  name: string;
  type: string;
  locationName: string;
  latitude: string;
  longitude: string;
  fillLevel: number;
  status: string;
  wetLevel?: number;
  dryLevel?: number;
  wetStatus?: string;
  dryStatus?: string;
  isActive: boolean;
}
interface Notification {
  id: number; message: string; type: string; isRead: boolean; createdAt: string;
}

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Dustbins",
    icon: "🗑️",
    color: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    textColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/50",
    accent: "bg-blue-500",
    sub: "Active locations",
    subIcon: <MapPin className="inline w-3 h-3 mr-1" />,
  },
  {
    key: "collection",
    label: "Bins Requiring Collection",
    icon: "🚛",
    color: "bg-red-50 dark:bg-red-950/30",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    textColor: "text-red-500 dark:text-red-400",
    border: "border-red-100 dark:border-red-900/50",
    accent: "bg-red-500",
    sub: "Immediate attention",
    subIcon: <AlertCircle className="inline w-3 h-3 mr-1" />,
  },
  {
    key: "fill",
    label: "Average Fill Level",
    icon: "📊",
    color: "bg-orange-50 dark:bg-orange-950/30",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    textColor: "text-orange-500 dark:text-orange-400",
    border: "border-orange-100 dark:border-orange-900/50",
    accent: "bg-orange-500",
    sub: "Across all bins",
    subIcon: <TrendingUp className="inline w-3 h-3 mr-1" />,
  },
  {
    key: "notif",
    label: "Unread Notifications",
    icon: "🔔",
    color: "bg-purple-50 dark:bg-purple-950/30",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    textColor: "text-purple-500 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-900/50",
    accent: "bg-purple-500",
    sub: "Need attention",
    subIcon: <Bell className="inline w-3 h-3 mr-1" />,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, loading, revalidate, mutate } = require("@/lib/hooks/useDashboardData").useDashboardData(session?.user?.id);
  const [activeTab, setActiveTab] = useState<"map" | "list" | "notifications">("map");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // expose helper to fetch fresh
  const fetchDashboardData = revalidate;

  // Refresh when a new dustbin/device is added elsewhere (BroadcastChannel/storage)
  useEffect(() => {
    if (!session?.user) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dustbin_added") fetchDashboardData();
    };

    const handleMessage = (ev: MessageEvent) => {
      try {
        const d = ev?.data;
        if (d?.type === "dustbin_added") fetchDashboardData();
      } catch (err) {
        // ignore
      }
    };

    // BroadcastChannel for same-origin tabs
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("wastewizard");
        bc.addEventListener("message", handleMessage as any);
      }
    } catch (err) {
      bc = null;
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (bc) {
        bc.removeEventListener("message", handleMessage as any);
        bc.close();
      }
    };
  }, [session?.user, fetchDashboardData]);

  const handleDeleteNotification = async (id: number) => {
    const token = localStorage.getItem("bearer_token");
    const res = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      mutate();
    } else {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkRead = async (id: number) => {
    const token = localStorage.getItem("bearer_token");
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      mutate();
    }
  };

  const dustbins = data?.dustbins ?? [];
  const notifications = data?.notifications ?? [];

  const totalDustbins = useMemo(() => dustbins.length, [dustbins]);
  const binsRequiringCollection = useMemo(() => dustbins.filter((b: any) => b.fillLevel >= 75).length, [dustbins]);
  const binsRequiringCollectionWet = useMemo(() => dustbins.filter((b: any) => (b.wetLevel ?? 0) >= 75).length, [dustbins]);
  const binsRequiringCollectionDry = useMemo(() => dustbins.filter((b: any) => (b.dryLevel ?? 0) >= 75).length, [dustbins]);
  const avgFillLevel = useMemo(() =>
    dustbins.length > 0 ? Math.round(dustbins.reduce((s: number, b: any) => s + (b.fillLevel ?? 0), 0) / dustbins.length) : 0,
  [dustbins]);
  const unreadNotifications = useMemo(() => notifications.length, [notifications]);

  const statValues = [
    totalDustbins,
    binsRequiringCollection,
    `${avgFillLevel}%`,
    unreadNotifications,
  ];

  // Derived metrics for Environmental Impact banner (presentational only)
  const wasteCollectedKg = Math.round(totalDustbins * 125);
  const co2ReducedKg = Math.round(totalDustbins * 3.5);
  const collectionsCompleted = Math.max(0, Math.round(totalDustbins * 0.6));
  const smartBinsActive = totalDustbins;
  const impactScore = Math.max(0, 100 - avgFillLevel);

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const notifColor = (type: string) => {
    if (type === "alert") return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    if (type === "warning") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-9 bg-muted rounded w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-[500px] bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {session?.user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your smart waste management system in real-time
          </p>
        </div>
        <button
          onClick={() => { fetchDashboardData(); }}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.key}
            className={`relative rounded-2xl border p-5 ${card.color} ${card.border} overflow-hidden`}
          >
            {/* Bottom accent bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.accent}`} />

            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground leading-tight pr-2">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>{statValues[i]}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subIcon}{card.sub}
              {card.key === 'collection' && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Wet: {binsRequiringCollectionWet} · Dry: {binsRequiringCollectionDry}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Main content card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Tab header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Dustbin Locations</h2>
            <p className="text-xs text-muted-foreground mb-3">Interactive map showing all dustbin locations and fill levels</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-border">
          {(["map", "list", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "map" && <MapPin className="w-3.5 h-3.5" />}
              {tab === "list" && <List className="w-3.5 h-3.5" />}
              {tab === "notifications" && (
                <span className="relative">
                  <Bell className="w-3.5 h-3.5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </span>
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("notifications", "Notifications")}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "map" && (
            <div className="space-y-3">
              <DustbinMap dustbins={dustbins} />
              {/* Legend */}
              <div className="flex items-center gap-4 justify-end text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Low Fill (0–50%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />Medium Fill (50–80%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />High Fill (80–100%)</span>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <DustbinList dustbins={dustbins} onRefresh={fetchDashboardData} />
          )}

          {activeTab === "notifications" && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Check className="w-12 h-12 mb-3 text-green-500" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm">No unread notifications</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${notifColor(n.type)}`}>
                      {n.type}
                    </span>
                    <p className="flex-1 text-sm text-foreground leading-relaxed">{n.message}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(n.createdAt)}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        title="Mark as read"
                        className="p-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        title="Delete"
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Environmental Impact Analytics Banner (visual only) */}
      <EnvironmentalImpactBanner
        wasteCollected={wasteCollectedKg}
        co2Reduced={co2ReducedKg}
        collectionsCompleted={collectionsCompleted}
        smartBinsActive={smartBinsActive}
        impactScore={impactScore}
      />
    </div>
  );
}
