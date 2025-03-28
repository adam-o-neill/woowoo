import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { SignOutButton } from "@/components/SignOutButton";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

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
          headerTitleStyle: {},
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="comment" size={24} color={color} />
          ),
        }}
      />
    </Stack>
  );
}
