import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import CountryPicker, { CountryCode } from "react-native-country-picker-modal";
import { useRouter } from "expo-router";

interface AuthError {
  message: string;
  status: number;
}

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [countryCode, setCountryCode] = useState("US");
  const [callingCode, setCallingCode] = useState("1");

  const handleAuth = async () => {
    try {
      const fullPhoneNumber = `+${callingCode}${phone}`;
      if (isLogin) {
        await signIn(fullPhoneNumber);
      } else {
        await signUp(fullPhoneNumber);
      }
      router.push("/(auth)/verify");
    } catch (error: any) {
      setError({ message: error.message, status: error.status || 500 });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Sign In" : "Create Account"}</Text>
      <View style={styles.phoneContainer}>
        <CountryPicker
          countryCode={countryCode as CountryCode}
          withFilter
          onSelect={(country) => {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
          }}
        />
        <Text style={styles.callingCode}>+{callingCode}</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.error}>{error.message}</Text>}
      <ThemedButton
        onPress={handleAuth}
        title={isLogin ? "Send Code" : "Register"}
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
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  phoneContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  callingCode: {
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
    marginTop: 7,
    fontFamily: "SpaceMono",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "#333",
    borderWidth: 1,
    paddingHorizontal: 8,
    color: "#fff",
    backgroundColor: "#111",
    borderRadius: 4,
    fontFamily: "SpaceMono",
    marginBottom: 12,
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
    color: "#fff",
    textDecorationLine: "underline",
    textAlign: "center",
    fontFamily: "SpaceMono",
  },
});

export default AuthScreen;
