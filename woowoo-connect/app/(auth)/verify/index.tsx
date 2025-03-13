import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

export default function VerifyScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { verifyOtp, hasCompletedProfile } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  // Focus the input when the screen loads
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Navigate based on profile status when verification is complete
  useEffect(() => {
    if (verificationComplete) {
      if (hasCompletedProfile) {
        router.replace("/(tabs)");
      } else {
        router.replace("/birth-info");
      }
    }
  }, [verificationComplete, hasCompletedProfile, router]);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      // Get profile status from verification
      const { hasCompletedProfile } = await verifyOtp(code);

      // Mark verification as complete
      setVerificationComplete(true);

      // Navigate based on profile status
      if (hasCompletedProfile) {
        router.replace("/(tabs)");
      } else {
        router.replace("/birth-info");
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Verification Failed",
        "The code you entered is invalid or has expired. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={styles.content}>
        <ThemedText variant="headingLarge" style={styles.title}>
          Verify Your Number
        </ThemedText>
        <ThemedText variant="bodyLarge" style={styles.subtitle}>
          Enter the 6-digit code we sent to your phone
        </ThemedText>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="sms-otp" // For iOS
            textContentType="oneTimeCode" // For iOS
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText
              variant="bodyLarge"
              style={{ color: "#fff", fontWeight: "600" }}
            >
              Verify
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.7,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 8,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
