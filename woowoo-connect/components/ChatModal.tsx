import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatInterface } from "./ChatInterface";
import { ThemedView } from "./ThemedView";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatModalProps {
  isVisible: boolean;
  onClose: () => void;
  connectionId?: string;
  friendName?: string;
}

export function ChatModal({
  isVisible,
  onClose,
  connectionId,
  friendName,
}: ChatModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.chatContainer}>
            <ChatInterface
              connectionId={connectionId}
              friendName={friendName}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 16 : 0,
  },
  closeButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
