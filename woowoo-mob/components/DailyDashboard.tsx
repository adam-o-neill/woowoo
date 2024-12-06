import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { format } from "date-fns";
import { apiClient } from "../lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  activity_suggestions: string[];
}

export function DailyDashboard() {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

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
      console.error("Error fetching daily insights:", error);
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

  return (
    <View
      style={styles.container}
      //   refreshControl={
      //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      //   }
    >
      <Text style={styles.date}>
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </Text>

      {insights && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Horoscope</Text>
            <Text style={styles.text}>{insights.daily_horoscope}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotional Forecast</Text>
            <View style={styles.moodContainer}>
              <Text style={styles.emoji}>
                {insights.emotional_forecast.emoji}
              </Text>
              <Text style={styles.text}>
                {insights.emotional_forecast.insight}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Moon Phase</Text>
            <Text style={styles.moonPhase}>
              {insights.moon_phase_insights.phase}
            </Text>
            <Text style={styles.text}>
              {insights.moon_phase_insights.insight}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Activities</Text>
            {insights.activity_suggestions.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.text}>{activity}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "SpaceMono",
  },
  date: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "SpaceMono",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SpaceMono",
    marginBottom: 12,
    fontWeight: "bold",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SpaceMono",
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
    fontFamily: "SpaceMono",
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
    fontFamily: "SpaceMono",
  },
});
