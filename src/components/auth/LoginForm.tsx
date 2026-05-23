"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      const redirectTo = searchParams.get("redirect") || "/myaccount";
      router.replace(redirectTo);
    }
  }, [session, isPending, searchParams, router]);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Registration successful! Please login to continue.");
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo = searchParams.get("redirect") || "/myaccount";
      
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error?.code) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Your email is not verified yet. Please check your inbox and verify your email to log in.");
        } else {
          toast.error("Invalid email or password. Please make sure you have registered an account and try again.");
        }
        setIsLoading(false);
        return;
      }

      // Immediate redirect after successful login
      localStorage.setItem("isAuth", "true");
      toast.success("Login successful! Redirecting...");
      
      // Force immediate redirect without waiting
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Show minimal loading state
  if (isPending) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background dark:bg-[#0E0E0F]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-foreground dark:text-white text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // If already logged in, show loading while redirecting
  if (session?.user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background dark:bg-[#0E0E0F]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-foreground dark:text-white text-sm">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background dark:bg-[#0E0E0F]">
      {/* LEFT PANEL - Optimized Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#0E0E0F] via-[#111113] to-[#1A1A1A]">
        <div className="relative z-10 flex flex-col justify-center px-8 sm:px-12 xl:px-20 w-full">
          <div className="flex items-center gap-3 mb-12 lg:mb-16">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/c0ec0623-d8a0-4fe9-add9-0b185bae3e04/generated_images/modern-minimalist-logo-icon-for-waste-wi-20d5715c-20251127175510.jpg"
                alt="Waste Wizard"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-white text-xl sm:text-2xl font-bold tracking-tight">Waste Wizard</span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
            Smart Waste<br />Management<br />Made Simple
          </h1>

          <p className="text-white/70 text-base sm:text-lg mb-8 sm:mb-12 max-w-md leading-relaxed">
            Real-time tracking, automated notifications, and IoT-powered dustbin monitoring.
          </p>

          <Link
            href="/"
            className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 
            bg-gradient-to-r from-[#16C47F] to-[#00C661] text-white font-semibold text-sm sm:text-base
            rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 
            hover:scale-[1.02] active:scale-[0.98] w-fit"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL - Optimized Form Section */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative min-h-screen bg-background dark:bg-[#0E0E0F]">
        <div className="w-full max-w-[480px] lg:max-w-[520px] relative my-8">
          <div className="bg-card dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-border dark:border-white/10">
            <div className="flex items-start justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white mb-1 sm:mb-2">Welcome Back</h2>
                <p className="text-muted-foreground dark:text-white/70 text-xs sm:text-sm">Sign in to continue</p>
              </div>
              
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 sm:p-2.5 rounded-xl bg-muted dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 
                  border border-border dark:border-white/10 transition-all duration-100 
                  shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                  )}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled={isLoading}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl 
                  bg-background dark:bg-[#0E0E0F] border border-border dark:border-white/10
                  text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/50 
                  focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-[#16C47F] 
                  focus:border-transparent transition-all duration-100 text-sm sm:text-base
                  disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1.5 ml-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    autoComplete="off"
                    disabled={isLoading}
                    className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl 
                    bg-background dark:bg-[#0E0E0F] border border-border dark:border-white/10
                    text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/50 
                    focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-[#16C47F] 
                    focus:border-transparent transition-all duration-100 pr-10 sm:pr-12 text-sm sm:text-base
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/50 
                    hover:text-foreground dark:hover:text-white/80 transition-colors duration-100 disabled:opacity-50 active:scale-95"
                  >
                    {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1.5 ml-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 px-6 rounded-2xl mt-6 sm:mt-7
                bg-gradient-to-r from-primary to-primary/80 dark:from-[#16C47F] dark:to-[#00C661] 
                text-primary-foreground dark:text-white font-semibold shadow-lg text-sm sm:text-base
                hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] 
                transition-all duration-100 
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 text-center space-y-2">
              <p className="text-muted-foreground dark:text-white/70 text-xs sm:text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary dark:text-[#16C47F] hover:text-primary/80 dark:hover:text-[#00C661] font-semibold transition-colors duration-100 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
              <Link
                href="/"
                className="block text-muted-foreground dark:text-white/70 hover:text-foreground dark:hover:text-white text-xs sm:text-sm transition-colors duration-100 hover:underline"
              >
                Back to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}