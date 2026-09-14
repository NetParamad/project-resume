"use client";

import { useEffect, useState } from "react";

/** Ticks up once per second while `active`, resetting to 0 whenever it goes false. */
export function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const tick = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(tick);
  }, [active]);

  return seconds;
}
