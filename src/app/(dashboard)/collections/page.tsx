"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Collection {
  id: number;
  dustbinId: number;
  scheduledDate: string;
  completedDate?: string;
  status: string;
  notes?: string;
}

interface Dustbin {
  id: number;
  name: string;
  locationName: string;
  type: string;
}

export default function CollectionsPage() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    dustbinId: "",
    scheduledDate: "",
    notes: "",
  });

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");

      const [collectionsRes, dustbinsRes] = await Promise.all([
        fetch("/api/collections", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/dustbins?is_active=1", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
      }

      if (dustbinsRes.ok) {
        const dustbinsData = await dustbinsRes.json();
        setDustbins(dustbinsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch collections data");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem("bearer_token");

      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dustbin_id: parseInt(formData.dustbinId),
          scheduled_date: formData.scheduledDate,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Collection scheduled successfully");
        setIsAddDialogOpen(false);
        setFormData({ dustbinId: "", scheduledDate: "", notes: "" });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to schedule collection");
      }
    } catch (error) {
      console.error("Error scheduling collection:", error);
      toast.error("Failed to schedule collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/collections?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Collection marked as ${newStatus}`);
        fetchData();
      } else {
        toast.error("Failed to update collection status");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection status");
    }
  };

  const handleCancelCollection = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/collections?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Collection cancelled successfully");
        fetchData();
      } else {
        toast.error("Failed to cancel collection");
      }
    } catch (error) {
      console.error("Error cancelling collection:", error);
      toast.error("Failed to cancel collection");
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const getDustbinName = (dustbinId: number) => {
    const dustbin = dustbins.find(d => d.id === dustbinId);
    return dustbin ? `${dustbin.name} (${dustbin.locationName})` : "Unknown";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      scheduled: "default",
      in_progress: "default",
      completed: "success",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const filteredCollections = filterStatus === "all" 
    ? collections 
    : collections.filter(c => c.status === filterStatus);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection Scheduling</h1>
          <p className="text-muted-foreground mt-1">Schedule and track waste collection pickups</p>
        </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Collection</DialogTitle>
                  <DialogDescription>
                    Schedule a pickup for a specific dustbin
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleScheduleCollection}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="dustbin">Dustbin</Label>
                      <Select
                        value={formData.dustbinId}
                        onValueChange={(value) => setFormData({ ...formData, dustbinId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a dustbin" />
                        </SelectTrigger>
                        <SelectContent>
                          {dustbins.map((dustbin) => (
                            <SelectItem key={dustbin.id} value={dustbin.id.toString()}>
                              {dustbin.name} - {dustbin.locationName} ({dustbin.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Scheduled Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any special instructions..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Scheduling..." : "Schedule Collection"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter */}
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "scheduled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("scheduled")}
                >
                  Scheduled
                </Button>
                <Button
                  variant={filterStatus === "in_progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("in_progress")}
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === "cancelled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collections List */}
          {filteredCollections.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
                <p className="text-muted-foreground text-center">
                  {filterStatus === "all" 
                    ? "Schedule your first collection to get started"
                    : `No ${filterStatus} collections`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <Card key={collection.id} className="glass hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {getStatusIcon(collection.status)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {getDustbinName(collection.dustbinId)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Scheduled: {new Date(collection.scheduledDate).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              {collection.completedDate && (
                                <p className="text-sm text-green-600">
                                  Completed: {new Date(collection.completedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(collection.status)}
                          </div>
                          {collection.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              Note: {collection.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {collection.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(collection.id, "in_progress")}
                            >
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelCollection(collection.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {collection.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(collection.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}
