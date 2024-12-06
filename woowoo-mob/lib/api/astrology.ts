import { supabase } from "@/lib/supabase";
import { apiClient } from "./client";

export const getDailyDashboard = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const response = await apiClient.authenticatedFetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/daily-dashboard`,
      data.session?.access_token || ""
    );

    if (!response.ok) {
      throw new Error("Failed to fetch daily dashboard");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching daily dashboard:", error);
    throw error;
  }
};
