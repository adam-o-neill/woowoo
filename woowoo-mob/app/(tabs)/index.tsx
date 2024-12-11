import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { format } from "date-fns";
import PlanetaryPositions from "@/components/PlanetaryPositions";
import { DailyDashboard } from "@/components/DailyDashboard";
import { BirthChart } from "@/components/BirthChart";

interface Planet {
  name: string;
  zodiacSign: string;
}

interface MoonData {
  phase: {
    phase: number;
    age: number;
    phaseName: string;
  };
  position: {
    zodiacSign: string;
    longitude: number;
  };
}

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [currentPositions, setCurrentPositions] = useState<Planet[]>([]);
  const [moonData, setMoonData] = useState<MoonData | null>(null);

  const fetchCurrentPositions = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const apiKey = process.env.EXPO_PUBLIC_API_KEY;

      const response = await fetch(
        `${apiUrl}/api/astrological-forecast-by-date?date=${today}`,
        {
          headers: {
            "x-api-key": apiKey || "",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setCurrentPositions(data.planets);
      setMoonData(data.moonData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching current positions:", error);
    }
  };

  useEffect(() => {
    fetchCurrentPositions();
    const interval = setInterval(fetchCurrentPositions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    console.log("loading");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  console.log("not loading");
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </Text>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>Current Positions</Text>
      </View>
      {currentPositions && <PlanetaryPositions planets={currentPositions} />}
      <DailyDashboard />
      <BirthChart />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    gap: 16,
    backgroundColor: "#000",
  },
  date: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "SpaceMono",
    marginTop: 24,
    textAlign: "center",
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    fontFamily: "SpaceMono",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default HomeScreen;
