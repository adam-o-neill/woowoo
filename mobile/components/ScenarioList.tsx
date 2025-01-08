import React from "react";
import { Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Scenario, scenarios } from "../data/scenarios";
import { router } from "expo-router";
import { Section } from "./Section";

export const ScenarioList: React.FC = () => {
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
      <Section>
        <Text style={styles.scenarioIcon}>{item.icon}</Text>
        <Text style={styles.scenarioTitle}>{item.title}</Text>
        <Text style={styles.scenarioDescription}>{item.description}</Text>
      </Section>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={scenarios}
      renderItem={renderScenario}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 16,
  },
  scenarioIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "SpaceMono",
    color: "#fff",
  },
  scenarioDescription: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "SpaceMono",
  },
});
