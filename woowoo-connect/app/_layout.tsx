import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
// import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Text } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from "react";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { palette } from "@/constants/palette";

// Import the Google Fonts loader
import {
  useFonts,
  Lora_400Regular,
  Lora_500Medium,
  Lora_700Bold,
  Lora_400Regular_Italic,
} from "@expo-google-fonts/lora";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { session, isLoading } = useAuth();
  const [authError, setAuthError] = useState(false);

  // Add error handling for auth state
  useEffect(() => {
    if (authError) {
      console.log("Authentication error detected, redirecting to auth screen");
    }
  }, [authError]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If no session, show auth screens
  if (!session) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack>
    );
  }

  // If authenticated, show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}

// Create a client
const queryClient = new QueryClient();

// Create a custom navigation theme that uses our colors
const getNavigationTheme = (isDark: boolean) => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: isDark ? palette.plum[400] : palette.plum[500],
      background: isDark ? palette.gray[900] : "#FFFFFF",
      card: isDark ? palette.gray[800] : "#FFFFFF",
      text: isDark ? palette.gray[50] : palette.gray[900],
      border: isDark ? palette.gray[700] : palette.gray[200],
      notification: isDark ? palette.rose[400] : palette.rose[500],
    },
    fonts: {
      // More elegant fonts
      regular: {
        fontFamily: "Lora",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "Lora",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "Lora",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "Lora",
        fontWeight: "700" as const,
      },
    },
  };
};

export default function RootLayout() {
  // Load fonts using the Google Fonts hook
  const [fontsLoaded] = useFonts({
    Lora: Lora_400Regular,
    LoraMedium: Lora_500Medium,
    LoraBold: Lora_700Bold,
    LoraItalic: Lora_400Regular_Italic,
    Astronomicon: require("../assets/fonts/Astronomicon.ttf"), // Keep your custom font
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomThemeProvider>
          {({ theme }) => (
            <ThemeProvider value={getNavigationTheme(theme === "dark")}>
              <AppNavigator />
              <StatusBar
                style={theme === "dark" ? "light" : "dark"}
                backgroundColor={
                  theme === "dark" ? palette.gray[900] : "#FFFFFF"
                }
              />
            </ThemeProvider>
          )}
        </CustomThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
