import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { ThemedText } from "./ThemedText";

interface ThemedButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function ThemedButton({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: ThemedButtonProps) {
  // Get theme colors
  const primary = useThemeColor({}, "buttonPrimary");
  console.log("primary", primary);
  const primaryText = useThemeColor({}, "buttonPrimaryText");
  const secondary = useThemeColor({}, "buttonSecondary");
  const secondaryText = useThemeColor({}, "buttonSecondaryText");
  const disabledBg = useThemeColor({}, "buttonDisabled");
  const disabledText = useThemeColor({}, "buttonDisabledText");
  const textColor = useThemeColor({}, "text");

  // Determine button styles based on variant
  let buttonStyle;
  let textStyle;

  switch (variant) {
    case "primary":
      buttonStyle = { backgroundColor: primary };
      textStyle = { color: primaryText };
      break;
    case "secondary":
      buttonStyle = { backgroundColor: secondary };
      textStyle = { color: secondaryText };
      break;
    case "outline":
      buttonStyle = [styles.outline, { borderColor: primary }];
      textStyle = { color: primary };
      break;
    case "ghost":
      buttonStyle = styles.ghost;
      textStyle = { color: primary };
      break;
    default:
      buttonStyle = { backgroundColor: primary };
      textStyle = { color: primaryText };
  }

  // Determine size styles
  let sizeStyle;
  let textVariant;

  switch (size) {
    case "small":
      sizeStyle = styles.small;
      textVariant = "labelSmall";
      break;
    case "large":
      sizeStyle = styles.large;
      textVariant = "labelLarge";
      break;
    default:
      sizeStyle = styles.medium;
      textVariant = "labelMedium";
  }

  // Handle disabled state
  if (disabled || loading) {
    buttonStyle = [
      ...(Array.isArray(buttonStyle) ? buttonStyle : [buttonStyle]),
      styles.disabled,
      { backgroundColor: disabledBg },
    ];
    textStyle = { ...textStyle, color: disabledText };
  }

  // Handle full width
  const widthStyle = fullWidth ? styles.fullWidth : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        sizeStyle,
        widthStyle,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      // disabled={disabled || loading}
      // activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}

        {loading ? (
          <ActivityIndicator
            size="small"
            color={textStyle.color}
            style={styles.loader}
          />
        ) : (
          <ThemedText variant={"labelMedium"} style={[styles.text, textStyle]}>
            {title}
          </ThemedText>
        )}

        {rightIcon && !loading && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    ...Layout.shadows.sm,
  },
  primary: {
    backgroundColor: "plum", // Will be overridden with theme color
  },
  secondary: {
    backgroundColor: "gold", // Will be overridden with theme color
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  small: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 32,
  },
  medium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
  loader: {
    marginHorizontal: Spacing.xs,
  },
});
