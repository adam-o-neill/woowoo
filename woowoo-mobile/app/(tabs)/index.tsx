import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Layout } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClearCacheButton from "@/components/ClearCacheButton";
import PlanetaryPositions from "@/components/PlanetaryPositions";
import MoonPhase from "@/components/MoonPhase";

interface Forecast {
  date: string;
  forecast: { content: string };
  emojiForecast: { content: string };
  planets: { name: string; zodiacSign: string }[];
}

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

const AstrologicalForecastScreen = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [currentPositions, setCurrentPositions] = useState<Planet[]>([]);
  const [moonData, setMoonData] = useState<MoonData | null>(null);

  const fetchCurrentPositions = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `http://localhost:3000/astrological-forecast-by-date?date=${today}`
      );
      const data = await response.json();
      setCurrentPositions(data.planets);
      setMoonData(data.moonData);
    } catch (error) {
      console.error("Error fetching current positions:", error);
    }
  };

  useEffect(() => {
    fetchCurrentPositions();
    const interval = setInterval(fetchCurrentPositions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);

    try {
      const cachedForecasts = await AsyncStorage.getItem("forecasts");
      const cachedData = cachedForecasts ? JSON.parse(cachedForecasts) : {};
      const today = new Date().toISOString().split("T")[0];

      delete cachedData[today];

      const missingDates = [];
      const updatedForecasts = [];

      // Check for cached data for the next 10 days
      for (let i = 0; i < 10; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(new Date().getDate() + i);
        const dateKey = forecastDate.toISOString().split("T")[0];

        if (cachedData[dateKey]) {
          updatedForecasts.push(cachedData[dateKey]); // Use cached forecast
        } else {
          missingDates.push(dateKey); // Track dates to fetch
        }
      }

      // Fetch forecasts for missing dates
      for (const date of missingDates) {
        const response = await fetch(
          `http://localhost:3000/astrological-forecast-by-date?date=${date}`
        );
        const forecast = await response.json();

        // Update cache and results
        cachedData[date] = forecast;
        updatedForecasts.push(forecast);
      }

      // Save updated cache
      await AsyncStorage.setItem("forecasts", JSON.stringify(cachedData));

      // Sort forecasts by date
      updatedForecasts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setForecasts(updatedForecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const getDayName = (dateString: string) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.forecastContainer,
        index === 0 && styles.firstItem,
        index === forecasts.length - 1 && styles.lastItem,
      ]}
      onPress={() => setExpandedDay(expandedDay === index ? null : index)}
    >
      <View style={styles.row}>
        <Text style={styles.dayText}>{getDayName(item.date)}</Text>
        <Text style={styles.emojiText}>{item.emojiForecast}</Text>
      </View>

      {expandedDay === index && (
        <Animated.View
          layout={Layout.springify()}
          style={styles.expandedContainer}
        >
          <PlanetaryPositions
            planets={item.planets}
            compact={true} // Add a compact prop for smaller display in list
          />
          <Text style={styles.forecastText}>{item.forecast}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );

  const reloadForecasts = async () => {
    setForecasts([]);
    setLoading(true);
    fetchForecasts();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={forecasts}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
        style={styles.list}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>woowoo</Text>
            </View>
            {currentPositions.length > 0 && (
              <>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitleText}>Current Positions</Text>
                </View>
                <PlanetaryPositions planets={currentPositions} />
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitleText}>Moon</Text>
                </View>
                {moonData && <MoonPhase moonData={moonData} />}
              </>
            )}
            {/* <ClearCacheButton onCacheCleared={reloadForecasts} /> */}

            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>Next 10 days</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  titleContainer: {
    paddingBottom: 20,
    paddingTop: 50,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
    fontFamily: "SpaceMono",
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
  list: {},
  columnWrapper: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
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
  forecastContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#fff",
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  emojiText: {
    fontSize: 24,
    fontFamily: "SpaceMono",
  },
  forecastText: {
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  expandedContainer: {
    borderRadius: 4,
    color: "#fff",
  },
  firstItem: {
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastItem: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

const markdownStyles = {
  body: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "SpaceMono",
  },
  paragraph: {
    marginVertical: 8,
  },
  heading1: {
    fontSize: 20,
    fontFamily: "SpaceMono",
    fontWeight: "bold",
    marginVertical: 12,
  },
  heading2: {
    fontSize: 18,
    fontFamily: "SpaceMono",
    fontWeight: "bold",
    marginVertical: 10,
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
  link: {
    color: "#64B5F6", // Light blue that works well on dark background
  },
};

export default AstrologicalForecastScreen;
