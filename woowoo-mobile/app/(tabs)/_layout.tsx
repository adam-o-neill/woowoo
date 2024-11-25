import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@react-navigation/native";

export default function Layout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
