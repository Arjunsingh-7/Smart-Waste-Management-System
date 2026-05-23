"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { memo, useCallback, useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  BarChart2,
  CalendarCheck,
  Bell,
  UserCircle,
  LogOut,
  Recycle,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { name: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { name: "Devices",       href: "/devices",        icon: Cpu },
  { name: "Analytics",     href: "/analytics",      icon: BarChart2 },
  { name: "Collections",   href: "/collections",    icon: CalendarCheck },
  { name: "Notifications", href: "/notifications",  icon: Bell },
  { name: "My Account",    href: "/myaccount",      icon: UserCircle },
];

/* ── Nav link list ─────────────────────────────────────────────────────── */
const NavItems = memo(function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ name, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            prefetch={true}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-white text-emerald-700 shadow-md"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {/* Active left accent bar */}
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
            )}

            <Icon
              className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-150 ${
                active ? "text-emerald-600" : "group-hover:scale-110"
              }`}
            />
            <span className="flex-1">{name}</span>

            {active && (
              <ChevronRight className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
            )}
          </Link>
        );
      })}
    </nav>
  );
});

/* ── Sidebar ───────────────────────────────────────────────────────────── */
export const DashboardSidebar = memo(function DashboardSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { data: session, refetch } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) { toast.error(error.code); setLoggingOut(false); return; }
      localStorage.removeItem("bearer_token");
      localStorage.removeItem("isAuth");
      toast.success("Logged out");
      router.push("/");
      refetch();
    } catch {
      toast.error("Logout failed");
      setLoggingOut(false);
    }
  }, [router, refetch]);

  const toggleTheme  = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
  const closeMobile  = useCallback(() => setMobileOpen(false), []);

  /* inner JSX extracted as a render function so it always gets fresh props */
  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#07160c] via-[#0b2a18] to-[#071116] shadow-inner backdrop-blur-sm border-r border-white/5">

      {/* ── Logo / Org label ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/6">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-black/10 backdrop-blur-sm ring-1 ring-emerald-400/10">
          <Recycle className="w-5 h-5 text-emerald-200 drop-shadow-[0_2px_6px_rgba(16,185,129,0.12)]" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-tight tracking-tight">Waste Wizard</p>
          <p className="text-emerald-200 text-[11px] uppercase tracking-wider">Organization •</p>
        </div>
      </div>

      {/* ── User mini-card (moved up) ── */}
      {session?.user && (
        <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl bg-white/6 border border-white/6 flex items-center gap-3 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ring-1 ring-white/8">
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate leading-tight">{session.user.name}</p>
            <p className="text-emerald-200 text-[12px] truncate">{session.user.email}</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
        </div>
      )}

      {/* ── Section label ── */}
      <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-200/40">
        Navigation
      </p>

      {/* ── Nav links ── */}
      <NavItems pathname={pathname ?? ""} onNavigate={closeMobile} />

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-white/6 mt-3" />

      {/* ── Bottom actions ── */}
      <div className="px-2 py-3 space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          {theme === "dark"
            ? <Sun  className="w-[18px] h-[18px] flex-shrink-0 group-hover:rotate-45  transition-transform duration-300" />
            : <Moon className="w-[18px] h-[18px] flex-shrink-0 group-hover:-rotate-12 transition-transform duration-300" />
          }
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 disabled:opacity-50"
        >
          {loggingOut ? (
            <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
          ) : (
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
          )}
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>

      {/* user card removed from bottom, moved above */}

      {/* ── Eco message card (bottom) ── */}
      <div className="mt-auto px-4 pb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-800/20 to-black/10 border border-white/6 backdrop-blur-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center">
            {/* small eco SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.243 2 6 4.5 6 7.5C6 10.5 8.239 13 11 13C13.761 13 16 10.5 16 7.5C16 4.5 12.757 2 12 2Z" fill="#16C47F" fillOpacity="0.95"/>
              <path d="M4 22C4 16.477 8.477 12 14 12" stroke="#16C47F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Keep Our City Clean</p>
            <p className="text-emerald-200 text-xs mt-0.5">Together we create a greener future</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 z-30 shadow-xl">
        {renderSidebar()}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#166534] flex items-center justify-between px-4 h-14 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Recycle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base">Waste Wizard</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobile} />
          <aside className="relative w-60 h-full flex flex-col shadow-2xl">
            {renderSidebar()}
          </aside>
        </div>
      )}
    </>
  );
});
