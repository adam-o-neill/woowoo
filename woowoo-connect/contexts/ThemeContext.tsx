import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";

// Define the theme type
type ThemeType = "light" | "dark";

// Define the theme context type
interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof Colors.light | typeof Colors.dark;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  layout: typeof Layout;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider component
export const ThemeProvider: React.FC<{
  children: React.ReactNode | ((props: ThemeContextType) => React.ReactNode);
}> = ({ children }) => {
  // Get the device color scheme
  const colorScheme = useColorScheme() as ThemeType;

  // State to manage the current theme
  const [theme, setTheme] = useState<ThemeType>(colorScheme || "light");

  // Update theme when device color scheme changes
  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Get the current theme's colors
  const colors = theme === "light" ? Colors.light : Colors.dark;

  // Create the context value
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    layout: Layout,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
