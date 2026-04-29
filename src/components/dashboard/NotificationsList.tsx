"use client";

import { memo, useState, useCallback } from "react";
import { AlertCircle, Info, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  onRefresh: () => void;
}

const formatTime = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const typeIcon = (type: string) => {
  if (type === "alert") return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
};

const typeBadge = (type: string) => {
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
  if (type === "alert") return <span className={`${base} bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400`}>Alert</span>;
  if (type === "warning") return <span className={`${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}>Warning</span>;
  return <span className={`${base} bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}>Info</span>;
};

const NotificationsList = memo(function NotificationsList({ notifications, onRefresh }: NotificationsListProps) {
  const [markingIds, setMarkingIds] = useState<Set<number>>(new Set());

  const handleMarkAsRead = useCallback(async (id: number) => {
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Marked as read");
        onRefresh();
      } else {
        toast.error("Failed to mark as read");
      }
    } catch {
      toast.error("Failed to mark as read");
    } finally {
      setMarkingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [onRefresh]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-xl">
        <Check className="h-12 w-12 text-green-500 mb-3" />
        <h3 className="text-base font-semibold mb-1">All Caught Up!</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
          No unread notifications. We'll alert you when something needs attention.
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
        <p className="text-sm text-muted-foreground">{notifications.length} unread</p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>
      {notifications.map((n) => (
        <div key={n.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
          <div className="mt-0.5">{typeIcon(n.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm leading-relaxed text-foreground">{n.message}</p>
              {typeBadge(n.type)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{formatTime(n.createdAt)}</span>
              <button
                onClick={() => handleMarkAsRead(n.id)}
                disabled={markingIds.has(n.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                {markingIds.has(n.id)
                  ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Check className="h-3 w-3" />}
                Mark Read
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default NotificationsList;
