import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Typography } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";

export type ThemedTextProps = TextProps & {
  variant?: keyof typeof Typography;
  color?: keyof typeof Colors.light | keyof typeof Colors.dark;
  align?: "auto" | "left" | "right" | "center" | "justify";
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = "bodyMedium",
  color = "text",
  align = "left",
  ...otherProps
}: ThemedTextProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    color as any
  );

  return (
    <Text
      style={[
        Typography[variant],
        { color: textColor, textAlign: align },
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
