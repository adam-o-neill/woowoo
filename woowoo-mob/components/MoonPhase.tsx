import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MoonPhaseProps {
  moonData: {
    phase: {
      phase: number;
      age: number;
      phaseName: string;
    };
    position: {
      zodiacSign: string;
      longitude: number;
    };
  };
}

const MoonPhase = ({ moonData }: MoonPhaseProps) => {
  const getMoonPhaseSymbol = (phaseName: string) => {
    const symbols: { [key: string]: string } = {
      "New Moon": "🌑",
      "Waxing Crescent": "🌒",
      "First Quarter": "🌓",
      "Waxing Gibbous": "🌔",
      "Full Moon": "🌕",
      "Waning Gibbous": "🌖",
      "Last Quarter": "🌗",
      "Waning Crescent": "🌘",
    };
    return symbols[phaseName] || "🌑";
  };

  const getNextPhase = (currentAge: number) => {
    // Moon cycle is approximately 29.53 days
    const daysUntilNew = 29.53 - currentAge;
    const daysUntilFull = 14.765 - (currentAge % 14.765);

    if (currentAge < 14.765) {
      // We're heading towards Full Moon
      return {
        phase: "Full Moon",
        days: Math.ceil(daysUntilFull),
      };
    } else {
      // We're heading towards New Moon
      return {
        phase: "New Moon",
        days: Math.ceil(daysUntilNew),
      };
    }
  };

  const nextPhase = getNextPhase(moonData.phase.age);

  return (
    <View style={styles.container}>
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseSymbol}>
          {getMoonPhaseSymbol(moonData.phase.phaseName)}
        </Text>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseName}>{moonData.phase.phaseName}</Text>
          <Text style={styles.phaseDetails}>
            {/* {moonData.phase.toFixed(1)}% illuminated */}
          </Text>
          <Text style={styles.phaseDetails}>
            Day {Math.floor(moonData.phase.age)} of cycle
          </Text>
        </View>
      </View>
      <Text style={styles.position}>
        Moon in {moonData.position.zodiacSign}{" "}
        {moonData.position.longitude.toFixed(1)}°
      </Text>
      <Text style={styles.nextPhase}>
        {nextPhase.phase} in {nextPhase.days} days
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
  },
  phaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  phaseSymbol: {
    fontSize: 48,
    marginRight: 16,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SpaceMono",
    fontWeight: "bold",
    marginBottom: 4,
  },
  phaseDetails: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 14,
  },
  position: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 14,
    marginTop: 8,
  },
  nextPhase: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default MoonPhase;
