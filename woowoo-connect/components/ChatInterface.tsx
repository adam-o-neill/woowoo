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
import { useFriends } from "@/hooks/useFriends";

interface ChatInterfaceProps {
  connectionId?: string;
  friendName?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  mentionedFriends?: Array<{
    id: string;
    name: string;
    relationshipId: string;
  }>;
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
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const { session } = useAuth();
  const { colors, spacing } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const { friends, isLoading: friendsLoading } = useFriends();
  const inputRef = useRef<TextInput>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Handle text input changes
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Check if we should show the mention list
    const lastAtSymbol = text.lastIndexOf("@", cursorPosition);
    if (lastAtSymbol !== -1 && lastAtSymbol < cursorPosition) {
      console.log("lastAtSymbol", lastAtSymbol);
      const query = text.substring(lastAtSymbol + 1, cursorPosition).trim();
      setMentionQuery(query);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  // Handle selection of a friend from the mention list
  const handleSelectFriend = (friend: any) => {
    const lastAtSymbol = inputText.lastIndexOf("@", cursorPosition);
    if (lastAtSymbol !== -1) {
      const beforeMention = inputText.substring(0, lastAtSymbol);
      const afterMention = inputText.substring(cursorPosition);
      const newText = `${beforeMention}@${friend.name} ${afterMention}`;
      setInputText(newText);
      setShowMentionList(false);

      // Focus the input and set cursor position after the mention
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Filter friends based on mention query
  const filteredFriends =
    friends?.filter((friend) =>
      friend.name.toLowerCase().includes(mentionQuery.toLowerCase())
    ) || [];

  console.log("filteredFriends", friends);

  // Extract mentioned friends from message text
  const extractMentionedFriends = (text: string) => {
    const mentionRegex = /@([a-zA-Z0-9 ]+)/g;
    const mentions = text.match(mentionRegex) || [];

    const mentionedFriends = mentions
      .map((mention) => {
        const name = mention.substring(1).trim(); // Remove @ symbol
        return friends?.find((friend) => friend.name === name);
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      relationshipId: string;
    }>;

    return mentionedFriends;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || friendsLoading) return;

    // Extract mentioned friends
    const mentionedFriends = extractMentionedFriends(inputText.trim());
    console.log("Mentioned friends:", mentionedFriends);

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user" as const,
      timestamp: new Date(),
      mentionedFriends:
        mentionedFriends.length > 0 ? mentionedFriends : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Prepare mentioned friends data for API
      const mentionedFriendsData = mentionedFriends.map((friend) => ({
        id: friend.id,
        relationshipId: friend.relationshipId,
        name: friend.name,
      }));

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
            mentionedFriends:
              mentionedFriendsData.length > 0
                ? mentionedFriendsData
                : undefined,
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
      fontWeight: "bold" as const,
      marginTop: 10,
      marginBottom: 5,
    },
    heading2: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "bold" as const,
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold" as const,
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
      fontWeight: "bold" as const,
      color: colors.text,
    },
    em: {
      fontStyle: "italic" as const,
      color: colors.text,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline" as const,
    },
    blockquote: {
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 8,
      paddingVertical: 4,
      marginVertical: 6,
    },
    code_block: {
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14,
    },
    code_inline: {
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
            : [styles.assistantMessage],
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 130 : 0}
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

        <ThemedView style={styles.mentionHintContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.text}
          />
          <ThemedText variant="bodySmall" style={styles.mentionHint}>
            Tip: Use @ to mention friends (e.g., @Jane) and include their charts
          </ThemedText>
        </ThemedView>

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
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
                borderColor: colors.inputBorder,
              },
            ]}
            value={inputText}
            onChangeText={handleTextChange}
            onSelectionChange={(event) =>
              setCursorPosition(event.nativeEvent.selection.start)
            }
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

        {showMentionList && filteredFriends.length > 0 && (
          <View
            style={[
              styles.mentionList,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <FlatList
              data={filteredFriends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.mentionItem}
                  onPress={() => handleSelectFriend(item)}
                >
                  <ThemedText>{item.name}</ThemedText>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="always"
            />
          </View>
        )}
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
  mentionList: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  mentionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mentionHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignSelf: "center",
  },
  mentionHint: {
    marginLeft: 4,
    fontSize: 12,
    opacity: 0.8,
  },
});
