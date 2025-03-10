import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-native-markdown-display";
import { scenarioAPI } from "@/lib/api/scenario";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { scenarios } from "@/data/scenarios";
import { useBirthChart } from "@/hooks/useBirthChart";

export default function ScenarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const { birthInfo } = useBirthChart();
  const { colors, spacing, borderRadius } = useTheme();

  const scenario = scenarios.find((s) => s.id === id);

  const { data: result, isLoading } = useQuery({
    queryKey: ["scenario", id],
    queryFn: async () => {
      if (!birthInfo?.id || !scenario) return null;
      return scenarioAPI.activateScenario(
        session?.access_token || "",
        scenario,
        birthInfo.id
      );
    },
    enabled: !!birthInfo?.id && !!scenario,
  });

  // Create markdown styles using theme colors
  const markdownStyles = {
    body: { color: colors.text },
    heading1: {
      color: colors.primary,
      fontSize: 24,
      marginBottom: 16,
      marginTop: 24,
    },
    heading2: {
      color: colors.primary,
      fontSize: 20,
      marginBottom: 12,
      marginTop: 20,
    },
    heading3: {
      color: colors.primary,
      fontSize: 18,
      marginBottom: 8,
      marginTop: 16,
    },
    paragraph: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
    },
    link: {
      color: colors.accent1,
      textDecorationLine: "underline" as const,
    },
    list: {
      color: colors.text,
      marginBottom: 12,
    },
    listItem: {
      color: colors.text,
      marginBottom: 4,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 16,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      paddingLeft: 16,
      marginLeft: 0,
      marginVertical: 12,
    },
    codeBlock: {
      backgroundColor: colors.backgroundSecondary,
      padding: 12,
      borderRadius: borderRadius.md,
      color: colors.text,
    },
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: scenario?.title || "Scenario",
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: spacing.md }}
      >
        {isLoading ? (
          <View style={[styles.loadingContainer, { padding: spacing.xl }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ThemedView variant="card" style={styles.resultContainer}>
            <Markdown style={markdownStyles}>
              {result || "_No result available_"}
            </Markdown>
          </ThemedView>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultContainer: {
    padding: 16,
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
});
