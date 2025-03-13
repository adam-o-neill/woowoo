import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { formatInTimeZone } from "date-fns-tz";
import { Section } from "./Section";
import { useBirthChart } from "@/hooks/useBirthChart";
import { BirthInfoForm } from "./BirthInfoInputs";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

// Add these symbol mappings at the top
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

export function BirthChart() {
  const { birthInfo, chartData, loading, error, updateBirthInfo } =
    useBirthChart();
  const { colors, spacing, borderRadius } = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Add this helper function to convert decimal degrees to DMS format
  const formatDegrees = (decimal: number) => {
    const sign = decimal >= 0 ? 1 : -1;
    decimal = Math.abs(decimal);

    const degrees = Math.floor(decimal);
    const minutesDecimal = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.floor((minutesDecimal - minutes) * 60);

    return `${degrees}°${minutes}'${seconds}"`;
  };

  // Add helper to get zodiac sign and position
  const getZodiacPosition = (longitude: number) => {
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const signIndex = Math.floor(longitude / 30);
    const position = longitude % 30;
    const sign = signs[signIndex];
    return {
      sign,
      symbol: zodiacSymbols[sign],
      position: formatDegrees(position),
    };
  };

  // Use the new BirthInfoInputs component
  if (!birthInfo || !chartData) {
    return <BirthInfoForm onSubmit={updateBirthInfo} loading={loading} />;
  }

  // Format the timestamp in UTC
  const formattedUtcTime = formatInTimeZone(
    new Date(chartData.timestamp),
    "UTC",
    "h:mm a"
  );

  const formattedUtcDate = formatInTimeZone(
    new Date(chartData.timestamp),
    "UTC",
    "MMMM d, yyyy"
  );

  return (
    <ThemedView>
      <ThemedText
        variant="headingMedium"
        color="primary"
        style={{ marginBottom: spacing.md }}
      >
        My Birth Chart
      </ThemedText>

      <Section title="Birth Details">
        <Text style={styles.text}>Date: {formattedUtcDate}</Text>
        <Text style={styles.text}>Time: {formattedUtcTime} UTC</Text>
        <Text style={styles.text}>Place: {chartData.location.place}</Text>
      </Section>

      <Section title="Angular Points">
        {[
          { name: "Ascendant (Rising)", value: chartData.ascendant },
          { name: "Midheaven (MC)", value: chartData.midheaven },
          { name: "Descendant (DC)", value: chartData.descendant },
          { name: "Imum Coeli (IC)", value: chartData.imumCoeli },
        ].map((point) => {
          const position = getZodiacPosition(point.value);
          return (
            <Text key={point.name} style={styles.text}>
              {point.name}:{" "}
              <Text style={styles.astronomicon}>{position.symbol}</Text>{" "}
              {position.sign} {position.position}
            </Text>
          );
        })}
      </Section>

      <Section title="Planetary Positions">
        {chartData.planets.map((planet: any) => {
          const position = getZodiacPosition(planet.longitude);
          return (
            <View key={planet.name} style={styles.planetRow}>
              <Text style={styles.text}>
                <Text style={styles.astronomicon}>
                  {planetSymbols[planet.name]}
                </Text>{" "}
                {planet.name}:{" "}
                <Text style={styles.astronomicon}>{position.symbol}</Text>{" "}
                {position.sign} {position.position}
              </Text>
            </View>
          );
        })}
      </Section>

      <Section title="House Cusps">
        {chartData.houses &&
          chartData.houses.map((cusp: any, index: any) => {
            const position = getZodiacPosition(cusp);
            return (
              <Text key={index} style={styles.text}>
                House {index + 1}:{" "}
                <Text style={styles.astronomicon}>{position.symbol}</Text>{" "}
                {position.sign} {position.position}
              </Text>
            );
          })}
      </Section>

      {chartData.aspects && (
        <Section title="Major Aspects">
          {chartData.aspects.map((aspect: any, index: any) => (
            <Text key={index} style={styles.text}>
              {aspect}
            </Text>
          ))}
        </Section>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  promptButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "#111",
  },
  promptText: {
    color: "#fff",
    textAlign: "center",

    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#000",
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  insightsTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  planetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: 8,
  },
  smallText: {
    color: "#999",

    fontSize: 12,
  },
  astronomicon: {
    fontFamily: "Astronomicon",
    fontSize: 18, // Slightly larger for better visibility
  },
  copyButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",

    fontSize: 16,
  },
});
