"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check, Zap, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePlan, type Plan, PLAN_LABELS } from "@/lib/hooks/usePlan";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const plans = [
  {
    key: "free" as Plan,
    name: "Free Plan",
    description: "Best for individuals and small organizations",
    price: "₹0",
    period: "/month",
    features: [
      "Add up to 3 dustbins",
      "Basic dashboard",
      "Map view",
      "Manual updates only",
    ],
    cta: "Get Started",
    popular: false,
    color: "border-border",
    btnClass: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  },
  {
    key: "standard" as Plan,
    name: "Standard Plan",
    description: "For schools, cafés, restaurants",
    price: "₹499",
    period: "/month",
    features: [
      "Up to 50 dustbins",
      "Live bin-monitoring (hardware required)",
      "Alerts & notifications",
      "Reports & analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
    color: "ring-2 ring-primary shadow-2xl scale-105",
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  {
    key: "enterprise" as Plan,
    name: "Enterprise Plan",
    description: "For municipalities & large organizations",
    price: "Contact Us",
    period: "",
    features: [
      "Unlimited dustbins",
      "API access",
      "Priority support",
      "Dedicated server",
      "Custom features",
    ],
    cta: "Contact Sales",
    popular: false,
    color: "border-border",
    btnClass: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const { plan: currentPlan } = usePlan();
  const router = useRouter();
  const [selecting, setSelecting] = useState<Plan | null>(null);

  const handleSelectPlan = async (planKey: Plan) => {
    if (!session?.user) {
      toast.error("Please login first to select a plan");
      router.push("/login?redirect=/pricing");
      return;
    }

    if (planKey === "enterprise") {
      window.location.href = "mailto:wastewizard24@gmail.com?subject=Enterprise Plan Inquiry";
      return;
    }

    setSelecting(planKey);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey }),
      });

      if (res.ok) {
        const label = PLAN_LABELS[planKey];
        toast.success(`✅ ${label} activated! (Demo mode — no payment required)`);
        router.push("/dashboard");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to select plan");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan for your waste management needs
            </p>
            {session?.user && (
              <p className="mt-3 text-sm text-primary font-medium">
                Current plan: <span className="font-bold">{PLAN_LABELS[currentPlan]}</span>
              </p>
            )}
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {plans.map((plan) => {
              const isActive = currentPlan === plan.key;
              const isLoading = selecting === plan.key;

              return (
                <div
                  key={plan.key}
                  className={`relative p-8 rounded-2xl glass border transition-all duration-300 ${plan.color} ${
                    plan.popular ? "" : "hover:shadow-xl"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Active badge */}
                  {isActive && session?.user && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ✓ Active
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.key)}
                    disabled={isLoading || (isActive && !!session?.user)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${plan.btnClass}`}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Activating...</>
                    ) : isActive && session?.user ? (
                      "✓ Current Plan"
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-2">
              All plans include 24/7 customer support and free updates
            </p>
            <p className="text-sm text-muted-foreground">
              Need help choosing? Contact us at{" "}
              <a href="mailto:wastewizard24@gmail.com" className="text-primary hover:underline">
                wastewizard24@gmail.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-3 bg-muted/50 inline-block px-4 py-2 rounded-full">
              🚧 Demo mode — plan selection is free, no payment required
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
