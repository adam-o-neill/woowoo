import { useAuth } from "@/contexts/AuthContext";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <ThemedText style={styles.text}>Sign Out</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  text: {
    fontSize: 14,
  },
});
