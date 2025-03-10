import { useAuth } from "@/contexts/AuthContext";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

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
      <Text style={styles.text}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  text: {
    color: "#fff",

    fontSize: 14,
  },
});
