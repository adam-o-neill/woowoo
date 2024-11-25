import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { AstronomyData } from "@/constants/Astronomy";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export const useAstronomyData = (refreshInterval = 3600000) => {
  // 1 hour default
  const [data, setData] = useState<AstronomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: astronomyData, error: functionError } =
        await supabase.functions.invoke("astronomy");

      if (functionError) throw functionError;
      setData(astronomyData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch astronomy data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up periodic refresh
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};
