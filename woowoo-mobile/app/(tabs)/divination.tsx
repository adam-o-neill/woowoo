import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
  Switch,
  Pressable,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TarotPicker } from "@/components/divination/TarotPicker";
import { tarotDeck } from "@/constants/Divination";
const CARD_WIDTH = Dimensions.get("window").width * 0.6;
const CARD_HEIGHT = CARD_WIDTH * 1.6;
const CARD_SPACING = 2;
const VISIBLE_CARDS = 5;

interface TarotCard {
  name: string;
  meaning: string;
  reversedMeaning?: string; // Optional reversed card meaning
  description?: string; // Optional detailed description
  suit?: string; // Optional suit (Major Arcana, Cups, Wands, etc.)
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"magic8" | "tarot" | "coin" | "iching">(
    "tarot"
  );
  const [answer, setAnswer] = useState("Select a card...");
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;
  const flipAnim = useRef(new RNAnimated.Value(0)).current;
  const [currentReading, setCurrentReading] = useState<{
    number: number;
    name: string;
    meaning: string;
  } | null>(null);
  const [history, setHistory] = useState<
    Array<{
      mode: string;
      result: string;
      timestamp: Date;
    }>
  >([]);
  const [intention, setIntention] = useState("");
  const [step, setStep] = useState<"intention" | "action" | "result">("action");

  const magicBallAnswers = [
    "It is certain",
    "Without a doubt",
    "Yes definitely",
    "Most likely",
    "Ask again later",
    "Cannot predict now",
    "Don't count on it",
    "My sources say no",
    "Very doubtful",
  ];

  const iChingHexagrams = [
    {
      number: 1,
      name: "Force (乾)",
      meaning: "Creative power, heaven, strong creative action",
    },
    {
      number: 2,
      name: "Field (坤)",
      meaning: "Receptive, yielding, responsive",
    },
    {
      number: 3,
      name: "Sprouting (屯)",
      meaning: "Beginning difficulty, gathering support",
    },
    {
      number: 4,
      name: "Enveloping (蒙)",
      meaning: "Youthful folly, inexperience",
    },
    {
      number: 5,
      name: "Waiting (需)",
      meaning: "Patience, timing, nourishment",
    },
    {
      number: 6,
      name: "Conflict (訟)",
      meaning: "Conflict, lawsuit, controversy",
    },
    {
      number: 7,
      name: "The Army (師)",
      meaning: "Discipline, leadership, organization",
    },
    {
      number: 8,
      name: "Holding Together (比)",
      meaning: "Union, alliance, partnership",
    },
    // ... Add all 64 hexagrams
  ];

  const [shuffledCards, setShuffledCards] = useState(tarotDeck);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

  const shake = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === "coin") {
      // Coin flip animation
      RNAnimated.sequence([
        RNAnimated.timing(flipAnim, {
          toValue: 4, // 2 full rotations
          duration: 750,
          useNativeDriver: true,
        }),
      ]).start(() => {
        flipAnim.setValue(0);
        setAnswer(Math.random() < 0.5 ? "Heads" : "Tails");
      });
    } else if (mode === "iching") {
      RNAnimated.sequence([
        // ... existing animation sequence
      ]).start(() => {
        let hexagram = "";
        for (let i = 0; i < 6; i++) {
          const coins = [
            Math.random() < 0.5 ? 2 : 3,
            Math.random() < 0.5 ? 2 : 3,
            Math.random() < 0.5 ? 2 : 3,
          ];
          const sum = coins.reduce((a, b) => a + b, 0);

          if (sum === 6) hexagram += "0";
          else if (sum === 7) hexagram += "1";
          else if (sum === 8) hexagram += "0";
          else if (sum === 9) hexagram += "1";
        }

        const hexagramNumber = parseInt(hexagram, 2);
        const reading =
          iChingHexagrams[hexagramNumber % iChingHexagrams.length];
        setAnswer(hexagram);
        setCurrentReading(reading);
      });
    } else {
      // Existing shake animation for magic 8 ball and tarot
      RNAnimated.sequence([
        RNAnimated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        RNAnimated.timing(rotateAnim, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        RNAnimated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (mode === "tarot") {
          const randomCard =
            tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
          setAnswer(`${randomCard.name}\n\n${randomCard.meaning}`);
        } else {
          const randomAnswer =
            magicBallAnswers[
              Math.floor(Math.random() * magicBallAnswers.length)
            ];
          setAnswer(randomAnswer);
        }
      });
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-30deg", "30deg"],
  });

  const flip = flipAnim.interpolate({
    inputRange: [0, 4],
    outputRange: ["0deg", "1440deg"], // 4 full rotations
  });

  const renderDivinationTool = () => {
    switch (mode) {
      case "coin":
        return (
          <RNAnimated.View
            style={[styles.coin, { transform: [{ rotateY: flip }] }]}
          >
            <ThemedView style={styles.coinInner}>
              <ThemedText style={styles.coinText}>{answer}</ThemedText>
            </ThemedView>
          </RNAnimated.View>
        );
      case "iching":
        return (
          <RNAnimated.View
            style={[styles.ichingContainer, { transform: [{ rotate: spin }] }]}
          >
            <ThemedView style={styles.ichingInner}>
              <View style={styles.hexagramContainer}>
                {answer.split("").map((line, index) => (
                  <View
                    key={index}
                    style={[
                      styles.ichingLine,
                      line === "1" ? styles.solidLine : styles.brokenLine,
                    ]}
                  />
                ))}
              </View>
              {currentReading && (
                <View style={styles.readingContainer}>
                  <ThemedText style={styles.readingTitle}>
                    {currentReading.name}
                  </ThemedText>
                  <ThemedText style={styles.readingMeaning}>
                    {currentReading.meaning}
                  </ThemedText>
                </View>
              )}
            </ThemedView>
          </RNAnimated.View>
        );
      default:
        return (
          <RNAnimated.View
            style={[styles.ball, { transform: [{ rotate: spin }] }]}
          >
            <ThemedView style={styles.answerContainer}>
              <ThemedText style={styles.answerText}>{answer}</ThemedText>
            </ThemedView>
          </RNAnimated.View>
        );
    }
  };

  const handleModeChange = (
    newMode: "magic8" | "tarot" | "coin" | "iching"
  ) => {
    setMode(newMode);
    setAnswer(
      newMode === "magic8"
        ? "Ask a question..."
        : newMode === "tarot"
        ? "Select a card..."
        : newMode === "coin"
        ? "Flip the coin..."
        : "Cast the coins..."
    );
    setCurrentReading(null);

    if (newMode === "tarot") {
      setShuffledCards([...tarotDeck].sort(() => Math.random() - 0.5));
      setSelectedCardIndex(null);
    }
  };

  const addToHistory = (result: string) => {
    setHistory((prev) =>
      [
        {
          mode,
          result,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 50)
    ); // Keep last 50 readings
  };

  const handleError = (error: Error) => {
    console.error(error);
    setAnswer("Something went wrong. Please try again.");
  };

  const renderIntentionStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>
        {mode === "magic8"
          ? "Ask Your Question"
          : mode === "tarot"
          ? "Set Your Intention"
          : mode === "coin"
          ? "State Your Question"
          : "Form Your Question"}
      </ThemedText>
      <TextInput
        style={styles.intentionInput}
        placeholder={
          mode === "magic8"
            ? "What would you like to know?"
            : mode === "tarot"
            ? "What guidance do you seek?"
            : mode === "coin"
            ? "What decision are you facing?"
            : "What situation needs clarity?"
        }
        value={intention}
        onChangeText={setIntention}
        multiline
        numberOfLines={2}
        placeholderTextColor="#666"
      />
      <Pressable
        style={[styles.button, !intention.trim() && styles.buttonDisabled]}
        disabled={!intention.trim()}
        onPress={() => setStep("action")}
      >
        <ThemedText style={styles.buttonText}>Continue</ThemedText>
      </Pressable>
    </View>
  );

  const renderActionStep = () => {
    switch (mode) {
      case "tarot":
        return (
          <TarotPicker
            onSelectCard={(card) => {
              setAnswer(`${card.name}\n\n${card.meaning}`);
              setStep("result");
              addToHistory(`Drew ${card.name}: ${card.meaning}`);
            }}
            shuffledCards={shuffledCards}
            selectedCardIndex={selectedCardIndex}
          />
        );
      case "magic8":
      case "coin":
      case "iching":
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>
              {mode === "magic8"
                ? "Shake the Magic 8 Ball"
                : mode === "coin"
                ? "Flip the Coin"
                : "Cast the Coins"}
            </ThemedText>
            <TouchableOpacity onPress={shake}>
              {renderDivinationTool()}
            </TouchableOpacity>
          </View>
        );
    }
  };

  const renderResultStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>Your Reading</ThemedText>
      <View style={styles.resultContainer}>
        <ThemedText style={styles.intentionDisplay}>"{intention}"</ThemedText>
        <ThemedText style={styles.resultText}>{answer}</ThemedText>
      </View>
      <Pressable
        style={styles.button}
        onPress={() => {
          setStep("intention");
          setIntention("");
          setAnswer("");
          setSelectedCardIndex(null);
        }}
      >
        <ThemedText style={styles.buttonText}>New Reading</ThemedText>
      </Pressable>
    </View>
  );

  const renderModeSelector = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={styles.modeDropdown}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.modeDropdownContent}>
            <Ionicons name={getModeIcon(mode)} size={24} color="#666" />
            <ThemedText style={styles.modeDropdownText}>
              {getModeLabel(mode)}
            </ThemedText>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.modeOptions}>
            {[
              { mode: "tarot", label: "Tarot Cards", icon: "grid" },
              { mode: "magic8", label: "Magic 8 Ball", icon: "help-circle" },
              { mode: "coin", label: "Coin Flip", icon: "disc" },
              { mode: "iching", label: "I Ching", icon: "infinite" },
            ].map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.modeOption,
                  mode === option.mode && styles.selectedModeOption,
                ]}
                onPress={() => {
                  handleModeChange(
                    option.mode as "magic8" | "tarot" | "coin" | "iching"
                  );
                  setIsExpanded(false);
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={mode === option.mode ? "#007AFF" : "#666"}
                />
                <ThemedText
                  style={[
                    styles.modeOptionText,
                    mode === option.mode && styles.selectedModeOptionText,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "tarot":
        return "grid";
      case "magic8":
        return "help-circle";
      case "coin":
        return "disc";
      case "iching":
        return "infinite";
      default:
        return "help-circle";
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "magic8":
        return "Magic 8 Ball";
      case "tarot":
        return "Tarot Cards";
      case "coin":
        return "Coin Flip";
      case "iching":
        return "I Ching";
      default:
        return "Select Mode";
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
          {renderModeSelector()}

          {step === "intention" && renderIntentionStep()}
          {step === "action" && renderActionStep()}
          {step === "result" && renderResultStep()}
        </ThemedView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // Base Container Styles
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },

  // Header Styles
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 30,
    textAlign: "center",
  },

  // Step Container Styles
  stepContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },

  // Input Styles
  intentionInput: {
    width: "100%",
    minHeight: 100,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  // Button Styles
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#B4D8FD",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Result Styles
  resultContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  intentionDisplay: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  resultText: {
    fontSize: 24,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 32,
    fontWeight: "600",
  },

  // Tarot Card Styles
  deckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    marginVertical: 20,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // cardBack: {
  //   width: "100%",
  //   height: "100%",
  //   borderRadius: 16,
  //   backgroundColor: "#2C1810",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderWidth: 2,
  //   borderColor: "#DAA520",
  // },
  // cardFront: {
  //   width: "100%",
  //   height: "100%",
  //   backgroundColor: "#FFF",
  //   padding: 10,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderRadius: 16,
  //   borderWidth: 2,
  //   borderColor: "#DAA520",
  // },
  // cardBackText: {
  //   color: "#DAA520",
  //   fontSize: 32,
  // },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  cardMeaning: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  remainingCards: {
    position: "absolute",
    bottom: -30,
    width: "100%",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 14,
    color: "#666",
  },

  // Common UI Elements
  // instruction: {
  //   marginTop: 20,
  //   fontSize: 16,
  //   color: "#666",
  //   textAlign: "center",
  //   paddingHorizontal: 20,
  // },

  // Coin Styles
  coin: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 8,
    borderColor: "#DAA520",
  },
  coinInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  coinText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },

  // Magic 8 Ball Styles
  ball: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  answerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  answerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#1A1A1A",
  },

  // I Ching Styles
  ichingContainer: {
    width: 200,
    height: 300,
    backgroundColor: "#F5F5DC",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#8B4513",
    overflow: "hidden",
  },
  ichingInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
  },
  hexagramContainer: {
    height: 140,
    justifyContent: "space-between",
    marginBottom: 10,
    paddingTop: 10,
  },
  ichingLine: {
    height: 3,
    backgroundColor: "#000",
    marginVertical: 6,
  },
  brokenLine: {
    width: 35,
    marginHorizontal: 5,
  },
  solidLine: {
    width: 80,
  },
  readingContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 5,
  },
  readingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  readingMeaning: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },

  // Add these missing Tarot deck styles
  tarotDeckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + CARD_SPACING * (VISIBLE_CARDS - 1),
    alignSelf: "center",
    position: "relative",
    justifyContent: "center",
    marginVertical: 20,
  },
  tarotDeck: {
    // paddingHorizontal: SCREEN_WIDTH / 2 - CARD_WIDTH / 2,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },

  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_SPACING / 2,
  },

  tarotCard: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#2C1810",
    borderWidth: 2,
    borderColor: "#DAA520",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  cardBack: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cardBackText: {
    color: "#DAA520",
    fontSize: 32,
  },

  instruction: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  modeSelector: {
    marginBottom: 20,
    width: "100%",
  },
  modeDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modeDropdownContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modeDropdownText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "#666",
  },
  modeOptions: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedModeOption: {
    backgroundColor: "#F8F8F8",
  },
  modeOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#666",
  },
  selectedModeOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
