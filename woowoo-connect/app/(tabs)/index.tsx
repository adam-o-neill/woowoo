import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { format } from "date-fns";
import { DailyDashboard } from "@/components/DailyDashboard";
import { BirthChart } from "@/components/BirthChart";
import { ScenarioList } from "../../components/ScenarioList";
import { useBirthChart } from "@/hooks/useBirthChart";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const HomeScreen = () => {
  const { birthInfo } = useBirthChart();
  const { colors, spacing } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ThemedText
        variant="displaySmall"
        align="center"
        style={{ marginTop: spacing.xl }}
      >
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </ThemedText>
      {/* 
      <View style={{ marginTop: spacing.lg }}>
        <DailyDashboard />
      </View>

      {birthInfo && birthInfo.id && (
        <View style={{ marginTop: spacing.lg }}>
          <ScenarioList />
        </View>
      )} */}

      <View style={{ marginTop: spacing.lg, marginBottom: spacing["3xl"] }}>
        <BirthChart />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;
