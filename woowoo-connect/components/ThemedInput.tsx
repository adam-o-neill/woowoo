import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Spacing, BorderRadius } from "@/constants/Spacing";
import { ThemedText } from "./ThemedText";

export type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPressRightIcon?: () => void;
  containerStyle?: any;
};

export function ThemedInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  containerStyle,
  style,
  placeholder,
  ...otherProps
}: ThemedInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Theme colors
  const inputBackground = useThemeColor({}, "inputBackground");
  const inputBorder = useThemeColor({}, "inputBorder");
  const inputText = useThemeColor({}, "inputText");
  const inputPlaceholder = useThemeColor({}, "inputPlaceholder");
  const inputFocusBorder = useThemeColor({}, "inputFocusBorder");
  const errorColor = useThemeColor({}, "error");

  // Border color logic
  let borderColor = inputBorder;
  if (error) {
    borderColor = errorColor;
  } else if (isFocused) {
    borderColor = inputFocusBorder;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText
          variant="labelMedium"
          style={[styles.label, error ? { color: errorColor } : null]}
        >
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: inputBackground,
            borderColor: borderColor,
          },
          isFocused && styles.focused,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: inputText },
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={inputPlaceholder}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...otherProps}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onPressRightIcon}
            disabled={!onPressRightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <ThemedText
          variant="labelSmall"
          style={[styles.error, { color: errorColor }]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 48,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.md,

    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    padding: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  rightIcon: {
    padding: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  focused: {
    borderWidth: 2,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
