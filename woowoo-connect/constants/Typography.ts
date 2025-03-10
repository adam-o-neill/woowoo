import { StyleSheet, TextStyle, Platform } from "react-native";

// Font families
const fonts = {
  primary: "Lora", // Your current font
  elegant: Platform.select({
    ios: "Baskerville",
    android: "serif",
    default: "serif",
  }),
  display: Platform.select({
    ios: "Didot",
    android: "serif",
    default: "serif",
  }),
};

// Font weights
type FontWeight = TextStyle["fontWeight"];

const fontWeights: Record<string, FontWeight> = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

// Line heights
const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Font sizes
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

// Text variants
export const Typography = StyleSheet.create({
  // Display text (for headers and important elements)
  displayLarge: {
    fontFamily: fonts.display,
    fontSize: fontSizes["5xl"],
    lineHeight: fontSizes["5xl"] * lineHeights.tight,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.5,
  },
  displayMedium: {
    fontFamily: fonts.display,
    fontSize: fontSizes["4xl"],
    lineHeight: fontSizes["4xl"] * lineHeights.tight,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.5,
  },
  displaySmall: {
    fontFamily: fonts.display,
    fontSize: fontSizes["3xl"],
    lineHeight: fontSizes["3xl"] * lineHeights.tight,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.5,
  },

  // Headings
  headingLarge: {
    fontFamily: fonts.elegant,
    fontSize: fontSizes["2xl"],
    lineHeight: fontSizes["2xl"] * lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  headingMedium: {
    fontFamily: fonts.elegant,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  headingSmall: {
    fontFamily: fonts.elegant,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.tight,
    fontWeight: fontWeights.bold,
  },

  // Body text
  bodyLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.regular,
  },

  // Labels
  labelLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.tight,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },
  labelMedium: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.tight,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.tight,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Other special text styles
  quote: {
    fontFamily: fonts.elegant,
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    fontWeight: fontWeights.light,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.4,
  },
});
