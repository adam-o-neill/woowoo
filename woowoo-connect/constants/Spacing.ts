/**
 * Consistent spacing values for margins, paddings, and layouts
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
  "5xl": 128,
};

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

export const Layout = {
  // Z-index values
  zIndex: {
    base: 0,
    elevated: 1,
    dropdown: 10,
    sticky: 100,
    modal: 1000,
    toast: 2000,
  },

  // Screen sizes
  screenSizes: {
    xs: 320,
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  },

  // Common aspect ratios
  aspectRatio: {
    square: 1,
    portrait: 3 / 4,
    landscape: 4 / 3,
    widescreen: 16 / 9,
  },

  // Shadow styles
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 12,
    },
  },
};
