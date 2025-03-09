import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useBirthChart } from "@/hooks/useBirthChart";

export default function OnboardingScreen() {
  const router = useRouter();
  const { birthInfo, loading, updateBirthInfo } = useBirthChart();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // If birth info already exists, skip onboarding
  useEffect(() => {
    if (!loading && birthInfo) {
      router.replace("/(tabs)");
    }
  }, [loading, birthInfo]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await updateBirthInfo({ dateOfBirth, timeOfBirth, placeOfBirth });
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error saving birth info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding • Enter Birth Info</Text>

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#666"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <TextInput
        style={styles.input}
        placeholder="Time of Birth (HH:MM)"
        placeholderTextColor="#666"
        value={timeOfBirth}
        onChangeText={setTimeOfBirth}
      />

      <TextInput
        style={styles.input}
        placeholder="Place of Birth"
        placeholderTextColor="#666"
        value={placeOfBirth}
        onChangeText={setPlaceOfBirth}
      />

      {isSaving ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Button title="Submit" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
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
});
