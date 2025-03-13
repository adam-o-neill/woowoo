import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { BirthInfoForm } from "@/components/BirthInfoInputs";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedInput } from "@/components/ThemedInput";
import { useBirthChart } from "@/hooks/useBirthChart";

interface BirthInfoData {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

export default function BirthInfoScreen() {
  const router = useRouter();
  const { personId, setHasCompletedProfile, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const { colors } = useTheme();
  const { updateBirthInfo } = useBirthChart();

  const handleSubmit = async (data: BirthInfoData) => {
    if (!personId) {
      Alert.alert(
        "Error",
        "User information not found. Please try logging in again."
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);

    try {
      // First, create a birth_info record using the API
      console.log("Updating birth info", data);
      const response = await updateBirthInfo({
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth,
        placeOfBirth: data.placeOfBirth,
      });

      if (response.error) throw response.error;

      // Update the person record with the name
      const { error: personError } = await supabase
        .from("person")
        .update({
          name: name.trim(),
        })
        .eq("id", personId);

      if (personError) throw personError;

      // Update local state
      setHasCompletedProfile(true);

      // Navigate to the dashboard
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving birth info:", error);
      Alert.alert(
        "Error",
        "There was a problem saving your information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <ThemedText variant="headingLarge" style={styles.title}>
              Complete Your Profile
            </ThemedText>
            <ThemedText variant="bodyMedium" style={styles.subtitle}>
              We need a few details to create your personalized astrological
              profile
            </ThemedText>

            <ThemedText variant="labelLarge">Your Name</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedInput
                style={{
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                }}
                placeholder="Your Name"
                placeholderTextColor={colors.text + "80"}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <BirthInfoForm onSubmit={handleSubmit} loading={loading} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50, // Add extra padding at the bottom
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  inputGroup: {
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
