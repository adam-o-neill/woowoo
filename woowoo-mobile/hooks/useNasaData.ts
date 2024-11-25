import { useState, useEffect } from "react";
import axios from "axios";

export type NasaData = {
  moonPhase: number;
  lunarDistance: number;
  visiblePlanets: string[];
  nextSolarEvent?: string;
};

export const useNasaData = () => {
  const [data, setData] = useState<NasaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNasaData = async () => {
      try {
        // You'll need to replace with your actual NASA API endpoint
        const response = await axios.get(
          `https://api.nasa.gov/planetary/earth-observation/data?api_key=${process.env.EXPO_PUBLIC_NASA_API_KEY}`
        );
        console.log(response.data);

        // Process the NASA data into the format we need
        const processedData: NasaData = {
          moonPhase: response.data.moonPhase,
          lunarDistance: response.data.lunarDistance,
          visiblePlanets: response.data.visiblePlanets || [],
          nextSolarEvent: response.data.nextSolarEvent,
        };

        setData(processedData);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Nasa error: ${err.message}`
            : "Failed to fetch NASA data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNasaData();
  }, []);

  return { data, loading, error };
};
