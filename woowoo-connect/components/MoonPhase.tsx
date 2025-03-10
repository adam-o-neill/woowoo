import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MoonPhaseProps {
  moonData: {
    phase: {
      phase: number | null; // Updated to allow null
      phaseName: string; // Changed from nested age property
    };
    position: {
      name: string; // Added missing property
      zodiacSign: string;
      longitude: number;
      latitude: number; // Added missing property
      distance: number; // Added missing property
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

  const getNextPhase = (currentPhase: number | null) => {
    return {
      phase: currentPhase && currentPhase < 0.5 ? "Full Moon" : "New Moon",
      days: 7,
    };
  };

  const nextPhase = getNextPhase(moonData.phase.phase);

  return (
    <View style={styles.container}>
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseSymbol}>
          {getMoonPhaseSymbol(moonData.phase.phaseName)}
        </Text>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseName}>{moonData.phase.phaseName}</Text>
          {moonData.phase.phase && (
            <Text style={styles.phaseDetails}>
              {(moonData.phase.phase * 100).toFixed(1)}% illuminated
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.position}>
        Moon in {moonData.position.zodiacSign}{" "}
        {moonData.position.longitude.toFixed(1)}°
      </Text>
      <Text style={styles.nextPhase}>
        {nextPhase.phase} in approximately {nextPhase.days} days
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

    fontWeight: "bold",
    marginBottom: 4,
  },
  phaseDetails: {
    color: "#fff",

    fontSize: 14,
  },
  position: {
    color: "#fff",

    fontSize: 14,
    marginTop: 8,
  },
  nextPhase: {
    color: "#fff",

    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default MoonPhase;
