"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="flex flex-col flex-1 animate-in fade-in-0 duration-200 ease-out"
    >
      {children}
    </div>
  );
}
