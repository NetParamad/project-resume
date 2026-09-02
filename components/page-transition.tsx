"use client";

import { usePathname } from "next/navigation";

/**
 * Keyed wrapper so route changes remount the subtree. No entrance animation:
 * fading the whole page in on first load pushed back LCP (the hero text) with
 * no real UX benefit.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="flex flex-col flex-1">
      {children}
    </div>
  );
}
