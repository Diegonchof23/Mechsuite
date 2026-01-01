// lib/useRefresh.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook que hace refresh automático de la página cada N segundos
 * Útil para aplicaciones que necesitan datos actualizados en tiempo real
 */
export function useRefresh(intervalSeconds: number = 10) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [router, intervalSeconds]);
}
