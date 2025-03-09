import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ThemedButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function ThemedButton({
  onPress,
  title,
  variant = "primary",
  disabled = false,
}: ThemedButtonProps) {
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary"
          ? { backgroundColor: buttonBackground }
          : styles.secondary,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          { color: buttonText },
          variant === "secondary" && { color: buttonBackground },
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: "SpaceMono",
    letterSpacing: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
