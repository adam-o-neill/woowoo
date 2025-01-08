import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";

interface AuthError {
  message: string;
  status: number;
}

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error: any) {
      setError({ message: error.message, status: error.status || 500 });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Sign In" : "Create Account"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button
        title={isLogin ? "Sign In" : "Create Account"}
        onPress={handleAuth}
      />
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.switchText}>
          {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#000", // Match your dark theme
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: "#fff",
    backgroundColor: "#111",
    borderRadius: 4,
    fontFamily: "SpaceMono",
  },
  error: {
    color: "#ff4444",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "SpaceMono",
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
  },
  switchText: {
    color: "#64B5F6",
    textAlign: "center",
    fontFamily: "SpaceMono",
  },
});

export default AuthScreen;
