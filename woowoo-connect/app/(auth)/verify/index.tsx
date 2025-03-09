import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";

const VerifyCodeScreen = () => {
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    try {
      await verifyOtp(code);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <ThemedButton title="Verify" onPress={handleVerify} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
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
  },
  error: {
    color: "#ff4444",
    marginBottom: 12,
    textAlign: "center",
  },
});

export default VerifyCodeScreen;
