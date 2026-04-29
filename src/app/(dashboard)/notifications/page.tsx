"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, AlertCircle, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  dustbinId?: number;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [markingAsRead, setMarkingAsRead] = useState<number[]>([]);

  useEffect(() => {
    if (session?.user) fetchNotifications();
  }, [session, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const queryParam = filter === "unread" ? "?is_read=0" : "";
      
      const response = await fetch(`/api/notifications${queryParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      setMarkingAsRead((prev) => [...prev, id]);
      const token = localStorage.getItem("bearer_token");

      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Notification marked as read");
        fetchNotifications();
      } else {
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    } finally {
      setMarkingAsRead((prev) => prev.filter((nId) => nId !== id));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const unreadNotifications = notifications.filter(n => !n.isRead);

      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/notifications/${notification.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Notification deleted");
        fetchNotifications();
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "alert":
        return <Badge variant="destructive">Alert</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
      default:
        return <Badge variant="default">Info</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />Notifications
            </h1>
            <p className="text-muted-foreground mt-1">Stay updated with alerts and system notifications</p>
          </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchNotifications}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </Button>
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Check className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {filter === "unread"
                    ? "You have no unread notifications. We'll notify you when something needs your attention."
                    : "No notifications found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`glass hover:shadow-md transition-all ${
                    !notification.isRead ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm leading-relaxed font-medium">
                            {notification.message}
                          </p>
                          {getNotificationBadge(notification.type)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markingAsRead.includes(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
