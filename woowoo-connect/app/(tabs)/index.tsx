import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import { DailyDashboard } from "@/components/DailyDashboard";
import { BirthChart } from "@/components/BirthChart";
import { ScenarioList } from "../../components/ScenarioList";
import { useBirthChart } from "@/hooks/useBirthChart";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import FriendsScreen from "./friends";
import { BirthInfoForm } from "@/components/BirthInfoInputs";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const { birthInfo, chartData } = useBirthChart();
  const { colors, spacing } = useTheme();
  const { verifyOtp, hasCompletedProfile, isLoading } = useAuth();
  const router = useRouter();

  if (!hasCompletedProfile) {
    router.replace("/birth-info");
  }

  if (isLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

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

      {!birthInfo || !chartData ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <>
          <View style={{ marginTop: spacing["4xl"] }}>
            <DailyDashboard />
          </View>

          <View style={{ marginTop: spacing["5xl"] }}>
            <FriendsScreen />
          </View>
        </>
      )}

      {/* {birthInfo && birthInfo.id && (
        <View style={{ marginTop: spacing.lg }}>
          <ScenarioList />
        </View>
      )}

      <View style={{ marginTop: spacing.lg, marginBottom: spacing["3xl"] }}>
        <BirthChart />
      </View> */}
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
