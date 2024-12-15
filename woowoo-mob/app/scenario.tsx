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
import { useBirthChart } from "@/contexts/BirthChartContext";
import { scenarios } from "@/data/scenarios";

export default function ScenarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const { birthInfo } = useBirthChart();

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

  return (
    <>
      <Stack.Screen
        options={{
          title: scenario?.title || "Scenario",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Markdown
              style={{
                body: styles.markdownBody,
                heading1: styles.heading1,
                heading2: styles.heading2,
                heading3: styles.heading3,
                paragraph: styles.paragraph,
                link: styles.link,
                list: styles.list,
                listItem: styles.listItem,
                hr: styles.hr,
                blockquote: styles.blockquote,
                code_block: styles.codeBlock,
              }}
            >
              {result || "_No result available_"}
            </Markdown>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultContainer: {
    padding: 20,
  },
  markdownBody: {
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  heading1: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "SpaceMono",
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "SpaceMono",
    marginBottom: 12,
    marginTop: 20,
  },
  heading3: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SpaceMono",
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  link: {
    color: "#4a9eff",
    textDecorationLine: "underline",
  },
  list: {
    color: "#fff",
    marginBottom: 12,
  },
  listItem: {
    color: "#fff",
    marginBottom: 4,
  },
  hr: {
    backgroundColor: "#333",
    height: 1,
    marginVertical: 16,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#333",
    paddingLeft: 16,
    marginLeft: 0,
    marginVertical: 12,
  },
  codeBlock: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 4,
    fontFamily: "SpaceMono",
    color: "#fff",
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
});
