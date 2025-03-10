import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { BorderRadius, Layout } from "@/constants/Spacing";

export type ThemedViewProps = ViewProps & {
  variant?: "default" | "card" | "elevated";
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = "default",
  ...otherProps
}: ThemedViewProps) {
  const { colors, borderRadius } = useTheme();

  let viewStyle;

  switch (variant) {
    case "card":
      viewStyle = [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
        },
      ];
      break;
    case "elevated":
      viewStyle = [
        styles.elevated,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.md,
          ...Layout.shadows.md,
        },
      ];
      break;
    default:
      viewStyle = { backgroundColor: colors.background };
  }

  return <View style={[viewStyle, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
  },
  elevated: {
    padding: 16,
  },
});
