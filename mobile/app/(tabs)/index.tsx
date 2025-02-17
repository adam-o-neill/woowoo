import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { format } from "date-fns";
import { DailyDashboard } from "@/components/DailyDashboard";
import { BirthChart } from "@/components/BirthChart";
import { ScenarioList } from "../../components/ScenarioList";
import { useBirthChart } from "@/hooks/useBirthChart";

const HomeScreen = () => {
  const { birthInfo } = useBirthChart();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </Text>
      <DailyDashboard />
      {birthInfo && birthInfo.id && <ScenarioList />}
      <BirthChart />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    gap: 16,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  date: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "SpaceMono",
    marginTop: 24,
    textAlign: "center",
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    fontFamily: "SpaceMono",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default HomeScreen;
