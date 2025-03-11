import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { useTheme } from "@/contexts/ThemeContext";

interface Friend {
  id: string;
  name: string;
  relationship?: string;
  email?: string;
  phone?: string;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await apiClient.authenticatedFetch(
        "/api/connections",
        session?.access_token || ""
      );

      if (response.connections) {
        const mappedFriends = response.connections.map((conn: any) => ({
          id: conn.relationship.id,
          name: conn.relatedPerson.name,
          relationship: conn.relationship.type,
        }));
        setFriends(mappedFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={[
        styles.friendCard,
        { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={() => router.push(`/friend/${item.id}`)}
    >
      <ThemedText variant="headingSmall">{item.name}</ThemedText>
      {item.relationship && (
        <ThemedText variant="bodySmall" color="secondary">
          {item.relationship}
        </ThemedText>
      )}
      <View style={styles.contactInfo}>
        {item.email && (
          <ThemedText variant="bodySmall" color="secondary">
            {item.email}
          </ThemedText>
        )}
        {item.phone && (
          <ThemedText variant="bodySmall" color="secondary">
            {item.phone}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="headingMedium">Your Friends</ThemedText>
        <ThemedButton
          title="Add Friend"
          variant="primary"
          size="small"
          onPress={() => router.push("/add-friend")}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText variant="bodyMedium" style={styles.emptyText}>
            You haven't added any friends yet.
          </ThemedText>
          <ThemedButton
            title="Add Your First Friend"
            onPress={() => router.push("/add-friend")}
          />
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 24,
  },
  friendCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactInfo: {
    marginTop: 8,
  },
});
