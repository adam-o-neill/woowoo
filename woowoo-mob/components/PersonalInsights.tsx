import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import {
  birthChartAPI,
  BirthInfo,
  ChartData,
  Planet,
} from "@/lib/api/birthChart";
import { format } from "date-fns";

const ZODIAC_SIGNS = [
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

export function PersonalInsights() {
  const { session } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  // Fetch existing birth info on component mount
  useEffect(() => {
    const fetchBirthInfo = async () => {
      try {
        if (!session?.access_token) return;

        const data = await birthChartAPI.getBirthInfo(session.access_token);
        setBirthInfo({
          dateOfBirth: data.birthInfo.dateOfBirth,
          timeOfBirth: data.birthInfo.timeOfBirth,
          placeOfBirth: data.birthInfo.placeOfBirth,
        });
        setChartData(JSON.parse(data.birthChart.chartData));
      } catch (error) {
        console.error("Error fetching birth info:", error);
      } finally {
        setFetchingData(false);
      }
    };

    if (session) {
      fetchBirthInfo();
    }
  }, [session]);

  const handleSubmit = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const data = await birthChartAPI.submitBirthInfo(session.access_token, {
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
      });

      setBirthInfo({
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
      });
      setChartData(JSON.parse(data.birthChart.chartData));
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving birth info:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlanetaryPosition = (planet: string, position: any) => {
    const sign = ZODIAC_SIGNS[position.sign];
    const degree = Math.floor(position.degree);
    const minute = Math.floor((position.degree - degree) * 60);
    return `${planet}: ${sign} ${degree}°${minute}'`;
  };

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

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

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

  return (
    <ScrollView style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Birth Chart</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Birth Details</Text>
        <Text style={styles.text}>
          Date: {format(new Date(chartData.timestamp), "PPP")}
        </Text>
        <Text style={styles.text}>
          Time: {format(new Date(chartData.timestamp), "p")}
        </Text>
        <Text style={styles.text}>Place: {chartData.location.place}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Angular Points</Text>
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planetary Positions</Text>
        {chartData.planets.map((planet) => {
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
              {/* <Text style={styles.smallText}>
                Lat: {formatDegrees(planet.latitude)}
              </Text> */}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>House Cusps</Text>
        {chartData.houses.map((cusp, index) => {
          const position = getZodiacPosition(cusp);
          return (
            <Text key={index} style={styles.text}>
              House {index + 1}:{" "}
              <Text style={styles.astronomicon}>{position.symbol}</Text>{" "}
              {position.sign} {position.position}
            </Text>
          );
        })}
      </View>

      {chartData.aspects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Major Aspects</Text>
          {chartData.aspects.map((aspect, index) => (
            <Text key={index} style={styles.text}>
              {aspect}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "SpaceMono",
    marginBottom: 12,
    fontWeight: "bold",
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
    marginBottom: 8,
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
