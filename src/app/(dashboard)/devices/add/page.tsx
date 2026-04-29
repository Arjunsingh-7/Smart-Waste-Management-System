"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Navigation2, Trash2, Wifi } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MapLocationPicker = dynamic(
  () => import("@/components/dashboard/MapLocationPicker").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

export default function AddDustbinPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "wet",
    locationName: "",
    latitude: "",
    longitude: "",
  });

  if (!session?.user) return null;

  const handleLocationSelect = (lat: string, lng: string, locationName?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      locationName: locationName || prev.locationName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.error("Please select a location on the map");
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/dustbins", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Dustbin added successfully!");
        router.push("/devices");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add dustbin");
      }
    } catch {
      toast.error("Failed to add dustbin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back + Title */}
      <div>
        <Button variant="ghost" onClick={() => router.push("/devices")} className="mb-3 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-full p-2.5">
            <Trash2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Dustbin</h1>
            <p className="text-muted-foreground">Register a new dustbin to the monitoring system.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trash2 className="h-5 w-5 text-primary" />
                Dustbin Information
              </CardTitle>
              <CardDescription>Enter the basic details for the new smart dustbin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Dustbin Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., BIN-001, Main Street Bin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationName" className="text-sm font-semibold">
                  Location Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="locationName"
                  placeholder="e.g., Main Street, Park Avenue"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Auto-filled when you select a location on the map</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Latitude <span className="text-destructive">*</span></Label>
                  <Input value={formData.latitude} readOnly placeholder="26.450321" className="bg-muted/50 font-mono text-sm h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Longitude <span className="text-destructive">*</span></Label>
                  <Input value={formData.longitude} readOnly placeholder="80.192122" className="bg-muted/50 font-mono text-sm h-11" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  if (!("geolocation" in navigator)) { toast.error("Geolocation not supported"); return; }
                  const id = toast.loading("Getting your location...");
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      toast.dismiss(id);
                      handleLocationSelect(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
                      toast.success("Location found!");
                    },
                    () => { toast.dismiss(id); toast.error("Could not get your location"); }
                  );
                }}
              >
                <Navigation2 className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>

              {!formData.latitude ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    Please select a location on the map before adding the dustbin
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    Location selected successfully!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Select Location on Map
              </CardTitle>
              <CardDescription>
                Search or click on the map to select a location. Use live tracking for real-time updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[520px] rounded-b-xl overflow-hidden">
                <MapLocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hardware info */}
        <Card className="glass border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wifi className="h-5 w-5 text-primary" />
              Hardware Integration
            </CardTitle>
            <CardDescription>After adding the dustbin, configure your IoT hardware to send data to:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm font-mono">POST /api/hardware/update-fill-level</p>
            </div>
            <Button type="button" variant="link" className="p-0 h-auto text-primary font-semibold"
              onClick={() => window.open("/hardware-guide", "_blank")}>
              View Hardware Integration Guide →
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/devices")} size="lg">Cancel</Button>
          <Button
            type="submit"
            disabled={submitting || !formData.latitude || !formData.longitude}
            size="lg"
            className="min-w-[160px]"
          >
            {submitting ? (
              <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />Adding...</>
            ) : (
              <><Trash2 className="h-4 w-4 mr-2" />Add Dustbin</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
