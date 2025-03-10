import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <ThemedView
      variant="card"
      style={[
        styles.section,
        {
          marginBottom: spacing.md,
          borderRadius: borderRadius.md,
          borderColor: colors.border,
        },
      ]}
    >
      <ThemedText
        variant="headingSmall"
        color="primary"
        style={{ marginBottom: spacing.sm }}
      >
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
});
