/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Elegant color palette designed for a sophisticated female audience
 */

// Base palette
const palette = {
  // Primary colors - Updated plum palette with deeper, more saturated colors
  plum: {
    50: "#f5eaf4",
    100: "#e8d0e6",
    200: "#d5b0d2",
    300: "#c28fbe",
    400: "#b06eaa", // More saturated
    500: "#9d4d96", // Deeper primary color
    600: "#8a3a83", // More saturated
    700: "#762870", // Deeper
    800: "#63175d", // More saturated
    900: "#50064a", // Deeper, more dramatic
  },

  // Secondary colors
  gold: {
    50: "#fbf8e9",
    100: "#f6efc4",
    200: "#f1e69f",
    300: "#ecdd7a",
    400: "#e7d455",
    500: "#e2cb30", // Secondary color
    600: "#c4af25",
    700: "#a5931a",
    800: "#87770f",
    900: "#695b04",
  },

  // Neutral colors
  gray: {
    50: "#f9f9f9",
    100: "#ededed",
    200: "#d3d3d3",
    300: "#b3b3b3",
    400: "#a0a0a0",
    500: "#898989",
    600: "#6c6c6c",
    700: "#202020",
    800: "#121212",
    900: "#000000",
  },

  // Accent colors
  teal: {
    400: "#3EB8B3",
    500: "#2AA29D",
  },
  rose: {
    400: "#E57F9B",
    500: "#D45F80",
  },

  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
};

export const Colors = {
  light: {
    // Text
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textTertiary: palette.gray[500],
    textInverse: palette.gray[50],

    // Background
    background: "#FFFFFF",
    backgroundSecondary: palette.gray[50],
    backgroundTertiary: palette.gray[100],

    // Brand colors
    primary: palette.plum[500],
    primaryLight: palette.plum[300],
    primaryDark: palette.plum[700],
    secondary: palette.gold[500],
    secondaryLight: palette.gold[300],
    secondaryDark: palette.gold[700],

    // UI Elements
    card: "#FFFFFF",
    border: palette.gray[200],
    divider: palette.gray[200],

    // Button
    buttonPrimary: palette.plum[500],
    buttonPrimaryText: "#FFFFFF",
    buttonSecondary: palette.gold[500],
    buttonSecondaryText: palette.gray[900],
    buttonDisabled: palette.gray[300],
    buttonDisabledText: palette.gray[500],

    // Input
    inputBackground: "#FFFFFF",
    inputBorder: palette.gray[300],
    inputText: palette.gray[900],
    inputPlaceholder: palette.gray[500],
    inputFocusBorder: palette.plum[500],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Special
    tint: palette.plum[500],
    accent1: palette.teal[500],
    accent2: palette.rose[500],
    tabIconDefault: palette.gray[500],
    tabIconSelected: palette.plum[500],

    // Add these new properties
    shadow: palette.gray[400],
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  dark: {
    // Text
    text: palette.gray[50],
    textSecondary: palette.gray[300],
    textTertiary: palette.gray[400],
    textInverse: palette.gray[900],

    // Background
    background: palette.gray[900],
    backgroundSecondary: palette.gray[800],
    backgroundTertiary: palette.gray[700],

    // Brand colors
    primary: palette.plum[400], // Slightly lighter in dark mode
    primaryLight: palette.plum[300],
    primaryDark: palette.plum[600],
    secondary: palette.gold[400], // Slightly lighter in dark mode
    secondaryLight: palette.gold[300],
    secondaryDark: palette.gold[600],

    // UI Elements
    card: palette.gray[800],
    border: palette.gray[700],
    divider: palette.gray[700],

    // Button
    buttonPrimary: palette.plum[400],
    buttonPrimaryText: "#FFFFFF",
    buttonSecondary: palette.gold[400],
    buttonSecondaryText: palette.gray[900],
    buttonDisabled: palette.gray[700],
    buttonDisabledText: palette.gray[500],

    // Input
    inputBackground: palette.gray[800],
    inputBorder: palette.gray[600],
    inputText: palette.gray[50],
    inputPlaceholder: palette.gray[500],
    inputFocusBorder: palette.plum[400],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Special
    tint: palette.plum[400],
    accent1: palette.teal[400],
    accent2: palette.rose[400],
    tabIconDefault: palette.gray[500],
    tabIconSelected: palette.plum[400],

    // Add these new properties
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};
