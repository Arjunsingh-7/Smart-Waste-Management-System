"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User, Mail, LogOut, Phone, Building2, Crown, Calendar, Shield, MapPin,
  Edit, Lock, Cpu, TrendingUp, Bell, Moon, Sun, Check, X, ChevronRight, MoreVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePlan, PLAN_LABELS } from "@/lib/hooks/usePlan";
import { useTheme } from "@/components/ThemeProvider";

interface UserProfile {
  organizationName: string;
  category: string;
  mobileNumber: string;
  plan: string;
  createdAt: string;
}

const QUICK_ACTIONS = [
  { icon: <Edit className="w-5 h-5" />, label: "Edit Profile", desc: "Update your personal information", href: "#", color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" },
  { icon: <Lock className="w-5 h-5" />, label: "Change Password", desc: "Update your account password", href: "#", color: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" },
  { icon: <Cpu className="w-5 h-5" />, label: "Manage Devices", desc: "View and manage your smart bins", href: "/devices", color: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" },
  { icon: <Crown className="w-5 h-5" />, label: "Upgrade Plan", desc: "Get more features and higher limits", href: "/pricing", color: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400" },
  { icon: <Bell className="w-5 h-5" />, label: "Notification Settings", desc: "Manage your alert preferences", href: "#", color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" },
];

const RECENT_ACTIVITIES = [
  { icon: "🔐", label: "Logged in to Waste Wizard", time: "Today, 12:05 PM", color: "bg-green-500/10" },
  { icon: "✏️", label: "Updated profile information", time: "Today, 11:47 AM", color: "bg-blue-500/10" },
  { icon: "🗑️", label: "Added new dustbin: BIN-001", time: "Yesterday, 05:32 PM", color: "bg-purple-500/10" },
  { icon: "🔔", label: "Received alert: Bin #47 full", time: "Yesterday, 04:15 PM", color: "bg-orange-500/10" },
];

export default function MyAccountPage() {
  const router = useRouter();
  const { data: session, refetch } = useSession();
  const { plan, limits } = usePlan();
  const { theme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dustbinCount, setDustbinCount] = useState(0);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      fetch(`/api/user-profile/${session.user.id}`).then((r) => r.ok ? r.json() : null),
      fetch("/api/dustbins?is_active=1", { headers: { Authorization: `Bearer ${localStorage.getItem("bearer_token")}` } })
        .then((r) => r.ok ? r.json() : []),
    ]).then(([prof, bins]) => {
      if (prof) setProfile(prof);
      setDustbinCount(bins.length);
    });
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) { toast.error(error.code); setLoggingOut(false); return; }
      localStorage.removeItem("bearer_token");
      localStorage.removeItem("isAuth");
      toast.success("Logged out successfully");
      router.push("/");
      refetch();
    } catch {
      toast.error("Logout failed");
      setLoggingOut(false);
    }
  };

  if (!session?.user) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  })();

  const profileCompletion = (() => {
    let filled = 3; // name, email always present
    if (profile?.mobileNumber) filled++;
    if (profile?.category) filled++;
    return Math.round((filled / 5) * 100);
  })();

  const checklist = [
    { label: "Basic Information", done: true },
    { label: "Organization Details", done: !!profile?.category },
    { label: "Contact Information", done: !!profile?.mobileNumber },
    { label: "Location Details", done: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {session.user.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings and preferences</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loggingOut ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogOut className="w-4 h-4" />}
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">

          {/* Profile card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl ring-4 ring-emerald-500/10 flex-shrink-0">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{session.user.name}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Administrator
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{session.user.email}</span>
              </div>
              {profile?.mobileNumber && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{profile.mobileNumber}</span>
                </div>
              )}
              {profile?.category && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span>{profile.category}</span>
                </div>
              )}
              {profile?.createdAt && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Member Since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile completion */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Profile Completion</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - profileCompletion / 100)}`}
                    className="text-emerald-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{profileCompletion}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {profileCompletion === 100 ? "Great job! Complete your profile to unlock all features." : "Complete your profile to unlock all features."}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.done ? (
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN */}
        <div className="lg:col-span-1 space-y-6">

          {/* Account & Plan */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Account & Plan Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Current Plan
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{PLAN_LABELS[plan]}</span>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Bins Used</span>
                  <span className="text-sm font-semibold text-foreground">
                    {dustbinCount} / {limits.maxBins === Infinity ? "Unlimited" : limits.maxBins}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min((dustbinCount / (limits.maxBins === Infinity ? 100 : limits.maxBins)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You are using {limits.maxBins === Infinity ? "unlimited" : `${Math.round((dustbinCount / limits.maxBins) * 100)}%`} of your plan limit
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Validity</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Not Applicable (Demo Mode)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.href !== "#" && router.push(action.href)}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-auto -mt-2" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6">

          {/* Preferences */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Preferences</h3>
            <div className="space-y-3">
              {[
                { icon: <Mail className="w-4 h-4" />, label: "Email Notifications", desc: "Receive email alerts", state: emailNotif, setState: setEmailNotif },
                { icon: <Phone className="w-4 h-4" />, label: "SMS Notifications", desc: "Receive SMS alerts", state: smsNotif, setState: setSmsNotif },
                { icon: <Bell className="w-4 h-4" />, label: "Push Notifications", desc: "Receive push alerts", state: pushNotif, setState: setPushNotif },
                { icon: theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />, label: "Dark Mode", desc: "Toggle dark theme", state: theme === "dark", setState: () => setTheme(theme === "dark" ? "light" : "dark") },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">{pref.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => typeof pref.setState === "function" && pref.setState(!pref.state)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      pref.state ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        pref.state ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Activity */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Security & Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Last Login</p>
                  <p className="text-xs text-muted-foreground">Today, 12:05 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Login Device</p>
                  <p className="text-xs text-muted-foreground">Chrome (Windows)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Login Location</p>
                  <p className="text-xs text-muted-foreground">Lucknow, India</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-semibold">Your account is secure</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">We keep your data safe and protected</p>
            <button className="w-full mt-3 text-xs font-semibold text-primary hover:underline">
              View Login History →
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <button className="text-xs font-semibold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center text-base flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight">{activity.label}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
