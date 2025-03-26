import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ChatModal } from "@/components/ChatModal";

const HomeScreen = () => {
  const { birthInfo, chartData } = useBirthChart();
  const { colors, spacing } = useTheme();
  const { verifyOtp, hasCompletedProfile, isLoading } = useAuth();
  const router = useRouter();
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText
            variant="displaySmall"
            align="center"
            style={{ marginTop: spacing.xl }}
          >
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </ThemedText>

          {!birthInfo || !chartData ? (
            <>
              <ThemedText>Loading...</ThemedText>
            </>
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
        </ThemedView>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[styles.floatingChatButton, { backgroundColor: colors.primary }]}
        onPress={() => setIsChatModalVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <ChatModal
        isVisible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  floatingChatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;
