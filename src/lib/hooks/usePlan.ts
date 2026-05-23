import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';

export type Plan = 'free' | 'standard' | 'enterprise';

export const PLAN_LIMITS = {
  free:       { maxBins: Infinity, analytics: true, liveMonitoring: true }, // REMOVED ALL RESTRICTIONS - Full demo access
  standard:   { maxBins: Infinity, analytics: true, liveMonitoring: true },
  enterprise: { maxBins: Infinity, analytics: true, liveMonitoring: true },
} as const;

export const PLAN_LABELS: Record<Plan, string> = {
  free:       'Free Plan',
  standard:   'Standard Plan',
  enterprise: 'Enterprise Plan',
};

export function usePlan() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<Plan>('free');
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const token = localStorage.getItem('bearer_token');
    fetch('/api/select-plan', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.plan) setPlan(data.plan as Plan); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [session?.user?.id]);

  const limits = PLAN_LIMITS[plan];

  return { plan, planLoading, limits };
}
