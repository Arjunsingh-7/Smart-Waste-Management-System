"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MapPin, Power, Lock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePlan, PLAN_LABELS } from "@/lib/hooks/usePlan";

interface Dustbin {
  id: number;
  name: string;
  type: string;
  locationName: string;
  latitude: string;
  longitude: string;
  fillLevel: number;
  status: string;
  isActive: boolean;
  lastCollectionDate?: string;
  nextCollectionDate?: string;
}

export default function DevicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { plan, limits } = usePlan();
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"delete" | "toggle" | null>(null);

  const atLimit = dustbins.length >= limits.maxBins;

  const fetchDustbins = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/dustbins?is_active=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setDustbins(await response.json());
      else toast.error("Failed to fetch dustbins");
    } catch {
      toast.error("Failed to fetch dustbins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) fetchDustbins();
  }, [session?.user, fetchDustbins]);

  const handleDeleteDustbin = useCallback(async (id: number) => {
    setActionId(id);
    setActionType("delete");
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/dustbins?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setDustbins((prev) => prev.filter((d) => d.id !== id));
        toast.success("Dustbin deleted");
      } else {
        toast.error("Failed to delete dustbin");
      }
    } catch {
      toast.error("Failed to delete dustbin");
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }, []);

  const handleToggleActive = useCallback(async (id: number, currentStatus: boolean) => {
    setActionId(id);
    setActionType("toggle");
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/dustbins?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        setDustbins((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isActive: !currentStatus } : d))
        );
        toast.success(`Dustbin ${!currentStatus ? "activated" : "deactivated"}`);
      } else {
        toast.error("Failed to update dustbin status");
      }
    } catch {
      toast.error("Failed to update dustbin status");
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Management</h1>
          <p className="text-muted-foreground mt-1">Add, configure, and monitor your smart waste bins</p>
          <p className="text-xs text-muted-foreground mt-1">
            Plan: <span className="font-semibold text-primary">{PLAN_LABELS[plan]}</span>
            {" · "}
            {dustbins.length} / {limits.maxBins === Infinity ? "Unlimited" : limits.maxBins} bins used
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDustbins} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              if (atLimit) {
                toast.error(`Max ${limits.maxBins} bins on ${PLAN_LABELS[plan]}.`);
                router.push("/pricing");
                return;
              }
              router.push("/devices/add");
            }}
          >
            {atLimit ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {atLimit ? "Upgrade to Add More" : "Add Dustbin"}
          </Button>
        </div>
      </div>

      {/* Plan limit warning */}
      {atLimit && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Bin limit reached ({limits.maxBins} bins on {PLAN_LABELS[plan]})
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Upgrade to Standard or Enterprise plan to add more dustbins.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/pricing")}
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Empty state */}
      {dustbins.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Dustbins Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first smart dustbin
            </p>
            <Button onClick={() => router.push("/devices/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Dustbin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dustbins.map((dustbin) => {
            const isActing = actionId === dustbin.id;
            return (
              <Card key={dustbin.id} className="glass hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{dustbin.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {dustbin.locationName}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={dustbin.type === "wet" ? "default" : "secondary"}>
                        {dustbin.type.toUpperCase()}
                      </Badge>
                      <Badge variant={dustbin.isActive ? "success" : "destructive"}>
                        {dustbin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fill Level</span>
                      <span
                        className={`font-semibold ${
                          dustbin.fillLevel >= 75
                            ? "text-red-500"
                            : dustbin.fillLevel >= 50
                            ? "text-amber-500"
                            : "text-green-500"
                        }`}
                      >
                        {dustbin.fillLevel}%
                      </span>
                    </div>
                    <Progress value={dustbin.fillLevel} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{dustbin.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coordinates</p>
                      <p className="font-medium text-xs">
                        {parseFloat(dustbin.latitude).toFixed(4)},{" "}
                        {parseFloat(dustbin.longitude).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={isActing}
                      onClick={() => handleToggleActive(dustbin.id, dustbin.isActive)}
                    >
                      {isActing && actionType === "toggle" ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Power className="h-4 w-4 mr-1" />
                      )}
                      {dustbin.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isActing}
                      onClick={() => handleDeleteDustbin(dustbin.id)}
                    >
                      {isActing && actionType === "delete" ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
