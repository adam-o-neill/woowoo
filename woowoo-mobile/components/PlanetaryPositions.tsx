import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

interface Planet {
  name: string;
  zodiacSign: string;
}

interface PlanetaryPositionsProps {
  planets: Planet[];
  compact?: boolean;
}

const planetSymbols: { [key: string]: string } = {
  Sun: "Q",
  Moon: "R",
  Mercury: "E",
  Venus: "V",
  Mars: "M",
  Jupiter: "J",
  Saturn: "S",
  Uranus: "U",
  Neptune: "N",
  Pluto: "P",
};

const zodiacSymbols: { [key: string]: string } = {
  Aries: "A",
  Taurus: "B",
  Gemini: "C",
  Cancer: "D",
  Leo: "E",
  Virgo: "F",
  Libra: "G",
  Scorpio: "H",
  Sagittarius: "I",
  Capricorn: "J",
  Aquarius: "K",
  Pisces: "L",
};

const PlanetaryPositions = ({
  planets,
  compact = false,
}: PlanetaryPositionsProps) => {
  const symbolStyle = {
    ...styles.symbol,
    fontSize: compact ? 16 : 24,
    width: compact ? 20 : 25,
    marginRight: compact ? 15 : 30,
  };

  return (
    <View>
      {/* {!compact && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {compact ? "" : "Current Positions"}
          </Text>
        </View>
      )} */}
      <ScrollView
        horizontal
        style={[styles.container, { borderWidth: compact ? 0 : 1 }]}
        showsHorizontalScrollIndicator={false}
      >
        <View>
          <View style={[styles.row, { paddingHorizontal: compact ? 0 : 16 }]}>
            {planets.map((planet, index) => (
              <Text key={`planet-${index}`} style={symbolStyle}>
                {planetSymbols[planet.name]}
              </Text>
            ))}
          </View>
          <View style={[styles.row, { paddingHorizontal: compact ? 0 : 16 }]}>
            {planets.map((planet, index) => (
              <Text key={`zodiac-${index}`} style={symbolStyle}>
                {zodiacSymbols[planet.zodiacSign]}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  container: {
    backgroundColor: "#000",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  symbol: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Astronomicon",
  },
});

export default PlanetaryPositions;
