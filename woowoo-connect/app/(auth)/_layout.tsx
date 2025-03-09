import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout() {
  const { session } = useAuth();

  // Redirect authenticated users to the main app
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(verify)" />
    </Stack>
  );
}
