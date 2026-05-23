"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrefetchOnHover() {
  const router = useRouter();

  useEffect(() => {
    const prefetched = new Set<string>();

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const a = target.closest && (target.closest("a[href]") as HTMLAnchorElement | null);
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (prefetched.has(href)) return;
      try {
        router.prefetch(href);
        prefetched.add(href);
      } catch {
        // ignore
      }
    };

    document.addEventListener("mouseover", handler, { passive: true });
    return () => document.removeEventListener("mouseover", handler);
  }, [router]);

  return null;
}
