import React, { useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Stack } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ChatModal } from "@/components/ChatModal";

export default function ChatScreen() {
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Astrology Chat" }} />
      <ThemedView style={styles.content}>
        <ThemedText variant="headingMedium" style={styles.title}>
          Astrological Insights
        </ThemedText>

        <ThemedText variant="bodyLarge" style={styles.description}>
          Get personalized astrological insights based on your birth chart and
          current planetary transits.
        </ThemedText>

        <ThemedButton
          title="Chat with Astrology AI"
          onPress={() => setIsChatModalVisible(true)}
          style={styles.button}
        />

        <ChatModal
          isVisible={isChatModalVisible}
          onClose={() => setIsChatModalVisible(false)}
        />
      </ThemedView>
    </SafeAreaView>
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
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    minWidth: 200,
  },
});
