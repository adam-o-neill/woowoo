import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface ChartCompatibilityProps {
  connectionId: string;
  friendName: string;
}

export function ChartCompatibility({
  connectionId,
  friendName,
}: ChartCompatibilityProps) {
  const [compatibility, setCompatibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { colors, spacing } = useTheme();

  useEffect(() => {
    const fetchCompatibility = async () => {
      try {
        setLoading(true);
        const response = await apiClient.authenticatedFetch(
          `/api/connections/${connectionId}/compatibility`,
          session?.access_token || ""
        );

        if (response.compatibility) {
          setCompatibility(response.compatibility);
        } else {
          setError("Could not retrieve compatibility data");
        }
      } catch (error) {
        console.error("Error fetching compatibility:", error);
        setError("Failed to load compatibility");
      } finally {
        setLoading(false);
      }
    };

    if (connectionId) {
      fetchCompatibility();
    }
  }, [connectionId]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (error || !compatibility) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText variant="bodyMedium">
          {error || "No compatibility data available"}
        </ThemedText>
      </ThemedView>
    );
  }

  const { overall, areas } = compatibility;

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return colors.success;
    if (score >= 0.6) return colors.primary;
    if (score >= 0.4) return colors.warning;
    return colors.error;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="headingMedium" style={styles.title}>
        Compatibility with {friendName}
      </ThemedText>

      <View style={styles.overallScoreContainer}>
        <View
          style={[
            styles.scoreCircle,
            { backgroundColor: getScoreColor(overall.score) },
          ]}
        >
          <ThemedText variant="headingLarge" style={{ color: "white" }}>
            {Math.round(overall.score * 100)}%
          </ThemedText>
        </View>
        <ThemedText variant="bodyMedium" style={styles.overallDescription}>
          {overall.description}
        </ThemedText>
      </View>

      <ThemedText variant="headingSmall" style={styles.sectionTitle}>
        Compatibility Areas
      </ThemedText>

      {Object.entries(areas).map(([key, area]: [string, any]) => (
        <View key={key} style={styles.areaContainer}>
          <View style={styles.areaHeader}>
            <ThemedText
              variant="labelLarge"
              style={{ textTransform: "capitalize" }}
            >
              {key}: {Math.round(area.score * 100)}%
            </ThemedText>
          </View>
          <ThemedText variant="bodySmall" style={styles.areaDescription}>
            {area.description}
          </ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  overallScoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  overallDescription: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  areaContainer: {
    marginBottom: 16,
  },
  areaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  areaDescription: {
    opacity: 0.8,
  },
});
