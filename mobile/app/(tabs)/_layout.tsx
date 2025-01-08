import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { SignOutButton } from "@/components/SignOutButton";
import { View } from "react-native";

export default function Layout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <SignOutButton />
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "WooWoo",
          headerTitleStyle: {
            fontFamily: "SpaceMono",
          },
        }}
      />
    </Stack>
  );
}
