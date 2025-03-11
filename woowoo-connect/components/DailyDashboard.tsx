import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { apiClient } from "../lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Section } from "./Section";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface DailyInsights {
  daily_horoscope: string;
  emotional_forecast: {
    insight: string;
    emoji: string;
  };
  moon_phase_insights: {
    phase: string;
    insight: string;
  };
  daily_quests: string[];
}

export function DailyDashboard() {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { colors, spacing } = useTheme();

  const fetchDailyInsights = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Check cache first
      const cachedData = await AsyncStorage.getItem("dailyDashboard");
      const cached = cachedData ? JSON.parse(cachedData) : {};

      // If we have today's data in cache, use it
      if (cached[today]) {
        console.log("Using cached daily dashboard data");
        setInsights(cached[today]);
        setLoading(false);
        return;
      }

      // If no cached data for today, fetch from API
      console.log("Fetching fresh daily dashboard data");
      const response = await apiClient.authenticatedFetch(
        "/api/daily-dashboard",
        session?.access_token || ""
      );

      // Update cache with new data
      cached[today] = response.insights;
      await AsyncStorage.setItem("dailyDashboard", JSON.stringify(cached));
      setInsights(response.insights);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Clear old cache entries (keep only last 7 days)
  const cleanupCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("dailyDashboard");
      if (cachedData) {
        const cached = JSON.parse(cachedData) as Record<string, DailyInsights>;
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        // Remove entries older than 7 days
        const updatedCache = Object.entries(cached).reduce<
          Record<string, DailyInsights>
        >((acc, [date, data]) => {
          if (new Date(date) >= sevenDaysAgo) {
            acc[date] = data;
          }
          return acc;
        }, {});

        await AsyncStorage.setItem(
          "dailyDashboard",
          JSON.stringify(updatedCache)
        );
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
    }
  };

  useEffect(() => {
    fetchDailyInsights();
    cleanupCache();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  console.log(insights);

  return (
    <ThemedView>
      <View>
        {insights && (
          <>
            <ThemedText variant="bodyLarge" style={{ textAlign: "center" }}>
              {insights.daily_horoscope}
            </ThemedText>
          </>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
  },
  moodContainer: {
    flexDirection: "column",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  moonPhase: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
  },
});
