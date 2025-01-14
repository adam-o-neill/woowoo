import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { birthChartAPI, BirthInfo } from "@/lib/api/birthChart";
import { useAuth } from "@/contexts/AuthContext";

export function useBirthChart() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["birthChart"],
    queryFn: () => birthChartAPI.getBirthInfo(session?.access_token || ""),
    enabled: !!session?.access_token,
    select: (data) => ({
      birthInfo: data.birthInfo,
      chartData: JSON.parse(data.birthChart.chartData),
    }),
  });

  console.log(data);
  console.log(error);

  const { mutateAsync: updateBirthInfo } = useMutation({
    mutationFn: (info: BirthInfo) =>
      birthChartAPI.submitBirthInfo(session?.access_token || "", info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birthChart"] });
    },
  });

  return {
    birthInfo: data?.birthInfo ?? null,
    chartData: data?.chartData ?? null,
    loading,
    error,
    updateBirthInfo,
    refreshBirthChart: () =>
      queryClient.invalidateQueries({ queryKey: ["birthChart"] }),
  };
}
