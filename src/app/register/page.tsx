"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Moon, Sun, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    "College",
    "Hospital",
    "Cafe",
    "Airport",
    "Municipal",
    "School",
    "Office",
    "Restaurant",
    "Others",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Instant feedback
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered. Please login instead.",
          INVALID_EMAIL: "Please enter a valid email address.",
          INVALID_PASSWORD: "Password must be at least 6 characters.",
        };
        toast.error(errorMap[error.code] || `Registration failed: ${error.message || error.code}`);
        setIsLoading(false);
        return;
      }

      if (data?.user?.id) {
        // Create user profile
        const profileResponse = await fetch("/api/user-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
          body: JSON.stringify({
            user_id: data.user.id,
            organization_name: formData.name,
            category: formData.category,
            mobile_number: formData.mobileNumber,
          }),
        });

        if (!profileResponse.ok) {
          console.error("Failed to create user profile");
        }

        // Send welcome email via server API (don't fail registration if email fails)
        try {
          const resp = await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, organizationName: formData.name }),
          });

          const emailData = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            console.error('[registration] send-welcome-email failed', emailData);
          } else {
            console.log('[registration] Welcome email queued', emailData);
          }
        } catch (emailError) {
          console.error('[registration] Failed to call send-welcome-email API:', emailError);
        }
      }

      toast.success("Account created successfully! Check your email for verification and welcome information.");
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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
            {isRegistered ? (
              <div className="text-center py-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-[#16C47F]/10 border border-[#16C47F]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(22,196,127,0.2)]">
                  <MailCheck className="w-8 h-8 text-[#16C47F]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground dark:text-white mb-3">Verification Required</h2>
                <p className="text-sm text-muted-foreground dark:text-white/70 mb-8 leading-relaxed">
                  We have sent an activation link to <strong className="text-foreground dark:text-white font-semibold">{formData.email}</strong>.
                  Please check your email and verify your account to continue logging in.
                </p>
                <div className="space-y-4">
                  <Link href="/login" prefetch={false}>
                    <Button className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 dark:from-[#16C47F] dark:to-[#00C661] text-primary-foreground dark:text-slate-950 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-100">
                      Go to Login Page
                    </Button>
                  </Link>
                  <button
                    onClick={() => setIsRegistered(false)}
                    className="block w-full text-center text-xs font-semibold text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white transition underline"
                  >
                    Back to signup form
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white mb-1 sm:mb-2">Create Account</h2>
                    <p className="text-muted-foreground dark:text-white/70 text-xs sm:text-sm">Join WasteWizard today</p>
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

                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      disabled={isLoading}
                      className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl 
                      bg-background dark:bg-[#0E0E0F] border border-border dark:border-white/10
                      text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/50 
                      focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-[#16C47F] 
                      focus:border-transparent transition-all duration-100 text-sm sm:text-base
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.name && (
                      <p className="text-destructive text-xs mt-1.5 ml-1">{errors.name}</p>
                    )}
                  </div>

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
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                      maxLength={10}
                      disabled={isLoading}
                      className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl 
                      bg-background dark:bg-[#0E0E0F] border border-border dark:border-white/10
                      text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/50 
                      focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-[#16C47F] 
                      focus:border-transparent transition-all duration-100 text-sm sm:text-base
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.mobileNumber && (
                      <p className="text-destructive text-xs mt-1.5 ml-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl 
                      bg-background dark:bg-[#0E0E0F] border border-border dark:border-white/10
                      text-foreground dark:text-white focus:outline-none focus:ring-2 
                      focus:ring-primary dark:focus:ring-[#16C47F] focus:border-transparent 
                      transition-all duration-100 appearance-none cursor-pointer text-sm sm:text-base
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-background dark:bg-[#0E0E0F] text-muted-foreground dark:text-white/50">Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-background dark:bg-[#0E0E0F] text-foreground dark:text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-destructive text-xs mt-1.5 ml-1">{errors.category}</p>
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

                  <div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/50 
                        hover:text-foreground dark:hover:text-white/80 transition-colors duration-100 disabled:opacity-50 active:scale-95"
                      >
                        {showConfirmPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 sm:py-3.5 px-6 rounded-2xl mt-4 sm:mt-6
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </form>

                <div className="mt-5 sm:mt-6 text-center space-y-2">
                  <p className="text-muted-foreground dark:text-white/70 text-xs sm:text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary dark:text-[#16C47F] hover:text-primary/80 dark:hover:text-[#00C661] font-semibold transition-colors duration-100 hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                  <Link
                    href="/"
                    className="block text-muted-foreground dark:text-white/70 hover:text-foreground dark:hover:text-white text-xs sm:text-sm transition-colors duration-100 hover:underline"
                  >
                    Back to Home Page
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}