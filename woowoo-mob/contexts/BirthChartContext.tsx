import React, { createContext, useContext, useState, useEffect } from "react";
import { birthChartAPI, BirthInfo, ChartData } from "@/lib/api/birthChart";
import { useAuth } from "./AuthContext";

interface BirthChartContextType {
  birthInfo: BirthInfo | null;
  chartData: ChartData | null;
  loading: boolean;
  error: Error | null;
  updateBirthInfo: (info: BirthInfo) => Promise<void>;
  refreshBirthChart: () => Promise<void>;
}

const BirthChartContext = createContext<BirthChartContextType | undefined>(
  undefined
);

export function BirthChartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshBirthChart = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const data = await birthChartAPI.getBirthInfo(session.access_token);
      setBirthInfo(data.birthInfo);
      setChartData(JSON.parse(data.birthChart.chartData));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch birth chart")
      );
      console.error("Error fetching birth info:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBirthInfo = async (info: BirthInfo) => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const data = await birthChartAPI.submitBirthInfo(
        session.access_token,
        info
      );
      setBirthInfo(info);
      setChartData(JSON.parse(data.birthChart.chartData));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update birth info")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      refreshBirthChart();
    }
  }, [session]);

  return (
    <BirthChartContext.Provider
      value={{
        birthInfo,
        chartData,
        loading,
        error,
        updateBirthInfo,
        refreshBirthChart,
      }}
    >
      {children}
    </BirthChartContext.Provider>
  );
}

export function useBirthChart() {
  const context = useContext(BirthChartContext);
  if (context === undefined) {
    throw new Error("useBirthChart must be used within a BirthChartProvider");
  }
  return context;
}
