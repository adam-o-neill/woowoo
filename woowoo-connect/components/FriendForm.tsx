import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { BirthInfoForm } from "./BirthInfoInputs";
import { apiClient } from "@/lib/api/client";

interface FriendFormProps {
  onSuccess?: (connection: any) => void;
}

export function FriendForm({ onSuccess }: FriendFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [birthInfo, setBirthInfo] = useState<{
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  } | null>(null);

  const { session } = useAuth();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const handleAddFriend = async () => {
    if (!name || !birthInfo) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.authenticatedFetch(
        "/api/connections",
        session?.access_token || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            relationType: relationship,
            notes,
            birthInfo,
          }),
        }
      );

      if (response.success) {
        Alert.alert("Success", `${name} has been added to your connections`);

        if (onSuccess) {
          onSuccess(response.connection);
        }
      } else {
        Alert.alert("Error", response.message || "Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBirthInfoSubmit = async (info: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  }) => {
    setBirthInfo(info);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.formContainer}>
          <ThemedText variant="headingMedium" style={styles.title}>
            Add a Friend
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText variant="labelLarge">Name*</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Friend's name"
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText variant="labelLarge">Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address (optional)"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText variant="labelLarge">Phone</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number (optional)"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText variant="labelLarge">Relationship</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="e.g., Friend, Partner, Family (optional)"
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText variant="labelLarge">Notes</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes about this friend (optional)"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.divider} />

          <ThemedText variant="headingSmall" style={styles.sectionTitle}>
            Birth Information
          </ThemedText>

          <BirthInfoForm
            onSubmit={handleBirthInfoSubmit}
            showSubmitButton={false}
          />

          <ThemedButton
            title="Add Friend"
            onPress={handleAddFriend}
            disabled={!name || !birthInfo || loading}
            loading={loading}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginTop: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 24,
  },
  birthInfoSummary: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 24,
  },
});
