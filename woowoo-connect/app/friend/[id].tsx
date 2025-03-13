import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { useTheme } from "@/contexts/ThemeContext";
import { ChartCompatibility } from "@/components/ChartCompatibility";
import { ChatInterface } from "@/components/ChatInterface";
import { ChatModal } from "@/components/ChatModal";
import { formatInTimeZone } from "date-fns-tz";

interface Friend {
  id: string;
  name: string;
  relationship?: string;
  email?: string;
  phone?: string;
  notes?: string;
  birthInfo: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  };
  chartData?: any;
}

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { colors, spacing } = useTheme();
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        console.log("fetching connection details", id);
        const response = await apiClient.authenticatedFetch(
          `/api/connections/${id}`,
          session?.access_token || ""
        );

        if (response.connection) {
          setFriend({
            id: response.connection.relationship.id,
            name: response.connection.person.name,
            relationship: response.connection.relationship.type,
            email: response.connection.person.email,
            phone: response.connection.person.phone,
            notes:
              response.connection.relationship.notes ||
              response.connection.person.notes,
            birthInfo: response.connection.birthInfo,
            chartData: response.connection.chartData,
          });
        }
      } catch (error) {
        console.error("Error fetching friend details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFriendDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!friend) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Friend not found</ThemedText>
      </ThemedView>
    );
  }
  const formattedUtcDate = formatInTimeZone(
    new Date(friend.birthInfo.dateOfBirth),
    "UTC",
    "MMMM d, yyyy"
  );
  return (
    <>
      <Stack.Screen options={{ title: friend.name }} />
      <ScrollView>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText variant="displaySmall">{friend.name}</ThemedText>
            {friend.relationship && (
              <ThemedText variant="labelLarge" color="secondary">
                {friend.relationship}
              </ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText variant="headingSmall">Contact Information</ThemedText>
            <View style={styles.infoCard}>
              {friend.email && (
                <View style={styles.infoRow}>
                  <ThemedText variant="labelMedium">Email:</ThemedText>
                  <ThemedText variant="bodyMedium">{friend.email}</ThemedText>
                </View>
              )}
              {friend.phone && (
                <View style={styles.infoRow}>
                  <ThemedText variant="labelMedium">Phone:</ThemedText>
                  <ThemedText variant="bodyMedium">{friend.phone}</ThemedText>
                </View>
              )}
              {!friend.email && !friend.phone && (
                <ThemedText variant="bodyMedium">
                  No contact info provided
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="headingSmall">Birth Information</ThemedText>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText variant="labelMedium">Date:</ThemedText>
                <ThemedText variant="bodyMedium">{formattedUtcDate}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText variant="labelMedium">Time:</ThemedText>
                <ThemedText variant="bodyMedium">
                  {friend.birthInfo.timeOfBirth}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText variant="labelMedium">Place:</ThemedText>
                <ThemedText variant="bodyMedium">
                  {friend.birthInfo.placeOfBirth}
                </ThemedText>
              </View>
            </View>
          </View>

          {friend.notes && (
            <View style={styles.section}>
              <ThemedText variant="headingSmall">Notes</ThemedText>
              <View style={styles.infoCard}>
                <ThemedText variant="bodyMedium">{friend.notes}</ThemedText>
              </View>
            </View>
          )}

          <ThemedView style={styles.section}>
            <ChartCompatibility
              connectionId={id as string}
              friendName={friend.name}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText variant="headingSmall">Astrological Chat</ThemedText>
          </ThemedView>

          <View style={styles.actions}>
            <ThemedButton
              title="Ask Astrology AI"
              onPress={() => setIsChatModalVisible(true)}
              icon="chatbubbles-outline"
            />

            <ThemedButton
              title="Send Invitation"
              onPress={() => {
                // Implement invitation functionality
                alert("Invitation feature coming soon!");
              }}
            />
          </View>
        </ThemedView>
      </ScrollView>
      <ChatModal
        isVisible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
        connectionId={id as string}
        friendName={friend.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  actions: {
    marginTop: 16,
    marginBottom: 32,
    gap: 16,
  },
});
