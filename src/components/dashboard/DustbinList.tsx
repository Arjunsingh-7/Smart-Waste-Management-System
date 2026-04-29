"use client";

import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Trash2, Calendar, RefreshCw } from "lucide-react";

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

interface DustbinListProps {
  dustbins: Dustbin[];
  onRefresh: () => void;
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

const fillColor = (level: number) =>
  level >= 75 ? "text-red-500" : level >= 50 ? "text-amber-500" : "text-green-500";

const fillLabel = (level: number) =>
  level >= 75 ? "Needs Collection" : level >= 50 ? "Half Full" : level >= 25 ? "Quarter Full" : "Empty";

const fillBadgeVariant = (level: number): any =>
  level >= 75 ? "destructive" : level >= 50 ? "secondary" : "default";

// Memoized individual row — only re-renders when its own data changes
const DustbinRow = memo(function DustbinRow({ dustbin }: { dustbin: Dustbin }) {
  return (
    <div className="glass p-5 rounded-xl border hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold">{dustbin.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{dustbin.locationName}</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Badge variant={dustbin.type === "wet" ? "default" : "secondary"} className="text-xs">
                {dustbin.type.toUpperCase()}
              </Badge>
              <Badge variant={fillBadgeVariant(dustbin.fillLevel)} className="text-xs">
                {fillLabel(dustbin.fillLevel)}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fill Level</span>
              <span className={`font-bold ${fillColor(dustbin.fillLevel)}`}>{dustbin.fillLevel}%</span>
            </div>
            <Progress
              value={dustbin.fillLevel}
              className={`h-2 ${dustbin.fillLevel >= 75 ? "[&>div]:bg-red-500" : dustbin.fillLevel >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="text-xs">
                <p className="text-muted-foreground">Last Collection</p>
                <p className="font-medium">{formatDate(dustbin.lastCollectionDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="text-xs">
                <p className="text-muted-foreground">Next Collection</p>
                <p className="font-medium">{formatDate(dustbin.nextCollectionDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const DustbinList = memo(function DustbinList({ dustbins, onRefresh }: DustbinListProps) {
  if (dustbins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-xl">
        <Trash2 className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold mb-1">No Dustbins Found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
          Add your first smart dustbin to monitor waste levels in real-time.
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {dustbins.length} active bin{dustbins.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
      {dustbins.map((d) => <DustbinRow key={d.id} dustbin={d} />)}
    </div>
  );
});

export default DustbinList;
