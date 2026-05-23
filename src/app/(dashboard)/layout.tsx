"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [checkingActive, setCheckingActive] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/user-profile?user_id=${session.user.id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIsActive(data.isActive !== false); // default to true if not present
        } else {
          setIsActive(true);
        }
      } catch (err) {
        console.error("Failed to check active status", err);
        setIsActive(true);
      } finally {
        setCheckingActive(false);
      }
    };

    if (session?.user) {
      checkProfileStatus();
    }
  }, [session]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      localStorage.removeItem("bearer_token");
      localStorage.removeItem("isAuth");
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  if (isPending || (session?.user && checkingActive)) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[#166534] h-screen" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) return null;

  if (isActive === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-950 p-4">
        <div className="w-full max-w-md p-8 bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-3xl text-center shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-3">Account Deactivated</h2>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-8 leading-relaxed">
            Your organization account has been temporarily deactivated by the system administrator. 
            Please contact our support team at <strong className="text-primary dark:text-[#16C47F]">support@wastewizard.com</strong> to reactivate your access.
          </p>
          <Button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="w-full py-6 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-lg flex items-center justify-center gap-2"
          >
            {loggingOut ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
