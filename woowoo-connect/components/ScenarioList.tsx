import React from "react";
import { Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Scenario, scenarios } from "../data/scenarios";
import { router } from "expo-router";
import { Section } from "./Section";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const ScenarioList: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const handleScenarioSelect = (scenario: Scenario) => {
    router.push({
      pathname: "/scenario",
      params: { id: scenario.id },
    });
  };

  const renderScenario = ({ item }: { item: Scenario }) => (
    <TouchableOpacity
      //   style={styles.scenarioCard}
      onPress={() => handleScenarioSelect(item)}
    >
      <Section title={item.title}>
        <Text style={styles.scenarioIcon}>{item.icon}</Text>
        <Text style={styles.scenarioTitle}>{item.title}</Text>
        <Text style={styles.scenarioDescription}>{item.description}</Text>
      </Section>
    </TouchableOpacity>
  );

  return (
    <ThemedView>
      <ThemedText variant="headingMedium" color="primary">
        My Scenarios
      </ThemedText>

      <FlatList
        data={scenarios}
        renderItem={renderScenario}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 8,
  },
  scenarioIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 14,
  },
});
