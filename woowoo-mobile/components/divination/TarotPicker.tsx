import { View, Dimensions, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TarotCard as TarotCardType } from "@/constants/Divination";
import { useState } from "react";
import * as Haptics from "expo-haptics";

const CARD_WIDTH = Dimensions.get("window").width * 0.4;
const CARD_HEIGHT = CARD_WIDTH * 1.6;
const STACK_OFFSET = 2; // How many pixels each card is offset from the one below
const VISIBLE_CARDS = 78; // Number of cards visible in the stack

interface TarotPickerProps {
  onSelectCard: (card: TarotCardType) => void;
  shuffledCards: TarotCardType[];
  selectedCardIndex: number | null;
}

export function TarotPicker({
  onSelectCard,
  shuffledCards,
  selectedCardIndex,
}: TarotPickerProps) {
  const handleCardPress = (card: TarotCardType, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectCard(card);
  };

  return (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>Select Your Card</ThemedText>
      <View style={styles.deckContainer}>
        {shuffledCards.slice(0, VISIBLE_CARDS).map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              {
                top: index * STACK_OFFSET,
                zIndex: VISIBLE_CARDS - index,
              },
              selectedCardIndex === index && styles.selectedCard,
            ]}
            onPress={() => handleCardPress(card, index)}
            activeOpacity={0.9}
          >
            <View style={styles.cardBack}>
              <ThemedText style={styles.cardBackText}>✧</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <ThemedText style={styles.instruction}>
        Tap any card to make your selection
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  deckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + STACK_OFFSET * VISIBLE_CARDS,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#2C1810",
    borderWidth: 2,
    borderColor: "#DAA520",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    borderColor: "#FFD700",
    borderWidth: 3,
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
});
