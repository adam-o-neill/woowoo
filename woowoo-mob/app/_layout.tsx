import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a custom dark theme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000",
    card: "#000",
    text: "#fff",
    border: "#333",
    primary: "#fff",
  },
  fonts: {
    ...DarkTheme.fonts,
    regular: {
      fontFamily: "SpaceMono",
      fontWeight: "400" as const,
    },
    medium: {
      fontFamily: "SpaceMono",
      fontWeight: "500" as const,
    },
    bold: {
      fontFamily: "SpaceMono",
      fontWeight: "700" as const,
    },
    heavy: {
      fontFamily: "SpaceMono",
      fontWeight: "900" as const,
    },
  },
};

function AppNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            // Add these to force a remount when auth state changes
            animation: "fade",
            presentation: "modal",
          }}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            // Add these to force a remount when auth state changes
            animation: "fade",
            presentation: "modal",
          }}
        />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Astronomicon: require("../assets/fonts/Astronomicon.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={CustomDarkTheme}>
        <AppNavigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}
