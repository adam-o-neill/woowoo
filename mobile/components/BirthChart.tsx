import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { formatInTimeZone } from "date-fns-tz";
import { Section } from "./Section";
import { useBirthChart } from "@/hooks/useBirthChart";

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
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  const handleSubmit = async () => {
    try {
      await updateBirthInfo({
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
      });
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving birth info:", error);
    }
  };

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

  if (!birthInfo || !chartData) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.promptText}>
            ✨ Add your birth details for personal insights
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Birth Details</Text>

              <TextInput
                style={styles.input}
                placeholder="Date of Birth (YYYY-MM-DD)"
                placeholderTextColor="#666"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />

              <TextInput
                style={styles.input}
                placeholder="Time of Birth (HH:MM)"
                placeholderTextColor="#666"
                value={timeOfBirth}
                onChangeText={setTimeOfBirth}
              />

              <TextInput
                style={styles.input}
                placeholder="Place of Birth"
                placeholderTextColor="#666"
                value={placeOfBirth}
                onChangeText={setPlaceOfBirth}
              />

              <View style={styles.buttonContainer}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button
                  title={loading ? "Saving..." : "Submit"}
                  onPress={handleSubmit}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
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
    <View style={styles.container}>
      <Section title="My Birth Chart" container>
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
      </Section>
    </View>
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
    fontFamily: "SpaceMono",
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
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "SpaceMono",
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: "#fff",
    backgroundColor: "#000",
    borderRadius: 4,
    fontFamily: "SpaceMono",
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
    color: "#fff",
    marginBottom: 12,
    fontFamily: "SpaceMono",
  },
  insightsText: {
    color: "#fff",
    fontFamily: "SpaceMono",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontFamily: "SpaceMono",
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
    fontFamily: "SpaceMono",
    fontSize: 12,
  },
  astronomicon: {
    fontFamily: "Astronomicon",
    fontSize: 18, // Slightly larger for better visibility
    color: "#fff",
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
    fontFamily: "SpaceMono",
    fontSize: 16,
  },
});
