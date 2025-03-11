import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatInterfaceProps {
  connectionId?: string;
  friendName?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export function ChatInterface({
  connectionId,
  friendName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: friendName
        ? `Ask me about your birth chart, ${friendName}'s birth chart, or your compatibility!`
        : "Ask me about your birth chart or current astrological transits!",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { colors, spacing } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await apiClient.authenticatedFetch(
        "/api/chat",
        session?.access_token || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage.text,
            connectionId,
          }),
        }
      );

      if (response.response) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          sender: "assistant" as const,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle error response
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process your request. Please try again.",
          sender: "assistant" as const,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error connecting to the server. Please try again later.",
        sender: "assistant" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Create markdown styles that match the app theme
  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: 16,
    },
    heading1: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 10,
      marginBottom: 5,
    },
    heading2: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 6,
      marginBottom: 3,
    },
    paragraph: {
      color: colors.text,
      marginVertical: 4,
    },
    list_item: {
      color: colors.text,
      marginVertical: 2,
    },
    strong: {
      fontWeight: "bold",
      color: colors.text,
    },
    em: {
      fontStyle: "italic",
      color: colors.text,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
    blockquote: {
      backgroundColor: colors.cardBackground,
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 8,
      paddingVertical: 4,
      marginVertical: 6,
    },
    code_block: {
      backgroundColor: colors.cardBackground,
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
    },
    code_inline: {
      backgroundColor: colors.cardBackground,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
      padding: 2,
      borderRadius: 2,
    },
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? [styles.userMessage, { backgroundColor: colors.primary }]
            : [
                styles.assistantMessage,
                { backgroundColor: colors.cardBackground },
              ],
        ]}
      >
        {isUser ? (
          <ThemedText style={{ color: isUser ? "#fff" : colors.text }}>
            {item.text}
          </ThemedText>
        ) : (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ThemedView style={styles.chatContainer}>
        <ThemedText variant="headingMedium" style={styles.title}>
          Astrology Chat
        </ThemedText>
        <ThemedText variant="bodySmall" style={styles.subtitle}>
          {friendName
            ? `Ask about your chart, ${friendName}'s chart, or your compatibility`
            : "Ask about your birth chart or current transits"}
        </ThemedText>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
                borderColor: colors.inputBorder,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your question..."
            placeholderTextColor={colors.inputPlaceholder}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={sendMessage}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
