import { useState, useEffect, useCallback } from "react";
import { scratchCardService } from "../services/scratchCardService";

export function useScratchCardStatusCounts(enabled = true) {
  const [counts, setCounts] = useState({});

  const refetch = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await scratchCardService.getStatusCounts();
      setCounts(res.data || {});
    } catch {
      // silent fail — sidebar badge will just show 0
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { counts, refetch };
}
