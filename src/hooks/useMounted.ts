"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Used to prevent hydration mismatches with Zustand persist middleware.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      setMounted(true);
    }
  });

  return mounted;
}
