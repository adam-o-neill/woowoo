import { useAuth } from "@/contexts/AuthContext";
import { Button } from "react-native";
import { useRouter } from "expo-router";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)"); // Redirect to the auth screen
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return <Button title="Sign Out" onPress={handleSignOut} />;
}
