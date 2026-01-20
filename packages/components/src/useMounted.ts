import { useState, useEffect } from "react";

/**
 * Hook to track if the component has mounted on the client.
 * Used for SSR protection - prevents hydration mismatches by
 * only rendering wagmi-dependent content after mount.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
