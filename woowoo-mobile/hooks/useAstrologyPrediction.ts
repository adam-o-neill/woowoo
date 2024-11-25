import { useState, useEffect } from "react";
import OpenAI from "openai";
import type { NasaData } from "./useNasaData";

type AstrologyPrediction = {
  dailyForecast: string;
  celestialEvents: string[];
  advice: string;
};

export const useAstrologyPrediction = (nasaData: NasaData | null) => {
  const [prediction, setPrediction] = useState<AstrologyPrediction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePrediction = async () => {
      if (!nasaData) return;

      try {
        const openai = new OpenAI({
          apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        });

        const prompt = `Based on the following astronomical data, generate an astrological forecast:
          - Moon Phase: ${nasaData.moonPhase}
          - Lunar Distance: ${nasaData.lunarDistance}
          - Visible Planets: ${nasaData.visiblePlanets.join(", ")}
          - Next Solar Event: ${nasaData.nextSolarEvent}
          
          Please provide a daily forecast, list of celestial events, and advice.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an expert astrologer who interprets astronomical data into meaningful astrological predictions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        });

        // Parse the response into our format
        // You might want to structure the AI's response more formally
        const prediction: AstrologyPrediction = {
          dailyForecast:
            response.choices[0].message.content?.split("\n")[0] || "",
          celestialEvents: nasaData.visiblePlanets.map(
            (planet) => `${planet} is visible and influencing your energy`
          ),
          advice:
            response.choices[0].message.content?.split("\n").slice(-1)[0] || "",
        };

        setPrediction(prediction);
      } catch (err) {
        setError(
          err instanceof Error
            ? `OpenAI error: ${err.message}`
            : "Failed to generate prediction"
        );
      } finally {
        setLoading(false);
      }
    };

    generatePrediction();
  }, [nasaData]);

  return { prediction, loading, error };
};
