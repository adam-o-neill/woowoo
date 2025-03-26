import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  LogBox,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import CountryPicker, { CountryCode } from "react-native-country-picker-modal";
import { useRouter } from "expo-router";

// Add this line after your imports to ignore the specific warning
LogBox.ignoreLogs([
  "Warning: Flag: Support for defaultProps will be removed from function components",
  "Support for defaultProps will be removed from function components",
]);

interface AuthError {
  message: string;
  status: number;
}

// Create a custom theme
const countryPickerTheme = {
  primaryColor: "#3498db",
  primaryColorVariant: "#2980b9",
  backgroundColor: "#ffffff",
  onBackgroundTextColor: "#000000",
  fontSize: 16,
  fontFamily: undefined,
  filterPlaceholderTextColor: "#999",
  activeOpacity: 0.7,
  itemHeight: 50,
  flagSize: 25,
  flagSizeButton: 20,
};

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [countryCode, setCountryCode] = useState("US");
  const [callingCode, setCallingCode] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async () => {
    if (!phone.trim()) {
      setError({ message: "Please enter a phone number", status: 400 });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const fullPhoneNumber = `+${callingCode}${phone}`;
      if (isLogin) {
        await signIn(fullPhoneNumber);
      } else {
        await signUp(fullPhoneNumber);
      }
      router.push("/(auth)/verify");
    } catch (error: any) {
      setError({ message: error.message, status: error.status || 500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Sign In" : "Create Account"}</Text>
      <View style={styles.phoneContainer}>
        <CountryPicker
          countryCode={countryCode as CountryCode}
          withFilter
          withFlagButton
          withCallingCode
          withCallingCodeButton
          onSelect={(country) => {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
          }}
          containerButtonStyle={styles.countryPickerButton}
          theme={countryPickerTheme}
          visible={false}
        />
        {/* <Text style={styles.callingCode}>+{callingCode}</Text> */}
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
        loading={isSubmitting}
        disabled={isSubmitting}
      />
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
        disabled={isSubmitting}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  phoneContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 52,
  },
  callingCode: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 7,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  error: {
    color: "#ff4444",
    marginBottom: 12,
    textAlign: "center",
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
  },
  switchText: {
    color: "#fff",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  countryPickerButton: {
    marginRight: 8,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AuthScreen;
