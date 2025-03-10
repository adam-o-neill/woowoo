import React from "react";
import { View, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";

export default function SettingsScreen() {
  const { colors, spacing, theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText variant="headingLarge" style={{ marginBottom: spacing.xl }}>
        Settings
      </ThemedText>

      <ThemedView variant="card" style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons
              name={theme === "dark" ? "moon" : "sunny"}
              size={24}
              color={colors.primary}
              style={{ marginRight: spacing.sm }}
            />
            <ThemedText variant="bodyLarge">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </ThemedText>
          </View>

          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{
              false: colors.backgroundTertiary,
              true: colors.primary,
            }}
            thumbColor={colors.background}
          />
        </View>
      </ThemedView>

      <ThemedButton
        title="Theme Showcase"
        variant="outline"
        onPress={() => router.push("/theme-showcase")}
        style={{ marginTop: spacing.lg }}
      />

      {/* Add your other settings here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
