"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Dustbin = any;
type Notification = any;

// Simple in-memory cache
const CACHE: {
  key?: string;
  data?: { dustbins: Dustbin[]; notifications: Notification[] };
  ts?: number;
} = {};

const TTL = 25_000; // 25s

export function useDashboardData(userId?: string) {
  const [data, setData] = useState<{ dustbins: Dustbin[]; notifications: Notification[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    if (!userId) return;
    try {
      setLoading(true);
      const now = Date.now();
      if (!force && CACHE.key === userId && CACHE.data && CACHE.ts && now - CACHE.ts < TTL) {
        setData(CACHE.data);
        return;
      }

      const token = localStorage.getItem("bearer_token");
      const [dRes, nRes] = await Promise.all([
        fetch(`/api/dustbins?is_active=1`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }),
        fetch(`/api/notifications?is_read=0`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }),
      ]);

      const dustbins = dRes.ok ? await dRes.json() : [];
      const notifications = nRes.ok ? await nRes.json() : [];

      const newData = { dustbins, notifications };
      CACHE.key = userId;
      CACHE.data = newData;
      CACHE.ts = Date.now();

      if (mounted.current) setData(newData);
    } catch (e) {
      console.error("useDashboardData fetch error:", e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    fetchData(false);
    return () => { mounted.current = false; };
  }, [fetchData]);

  const revalidate = useCallback(() => fetchData(true), [fetchData]);

  const mutate = useCallback((updater: (prev: { dustbins: Dustbin[]; notifications: Notification[] } | null) => any) => {
    const next = updater(CACHE.data ?? null);
    CACHE.data = next;
    CACHE.ts = Date.now();
    setData(next);
  }, []);

  return { data, loading, revalidate, mutate };
}
