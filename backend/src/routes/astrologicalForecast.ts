import express, { Request, Response } from "express";
import { validateDateParam } from "../middleware/validation";
import {
  calculatePlanetPositions,
  getMoonPhase,
  getSignificantAspects,
  getAstrologicalEvents,
} from "../utils/astrology";
import { openai } from "../utils/openai";

const router = express.Router();

interface DateQuery {
  date?: string;
}

interface PlanetData {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  zodiacSign: string;
}

interface MoonPhase {
  phaseName: string;
  phase: number;
}

interface AstrologicalEvent {
  description: string;
}

router.get(
  "/astrological-forecast-by-date",
  validateDateParam,
  async (req: Request<{}, {}, {}, DateQuery>, res: Response) => {
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ error: "Date query parameter is required." });
    }

    try {
      const jsDate = new Date(date);
      const planetData = calculatePlanetPositions(jsDate);

      const moonPhase = getMoonPhase(date);
      const aspects = getSignificantAspects(planetData);
      const events = getAstrologicalEvents(planetData, date);

      // Call OpenAI with the updated prompts
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a brief astrologer. List only the significant changes that occur on this day. Maximum 3 lines.",
          },
          {
            role: "user",
            content: `Changes for ${date}:
          ${events
            .map((event: AstrologicalEvent) => event.description)
            .join("\n")}
          ${
            moonPhase.phaseName === "New Moon" ||
            moonPhase.phaseName === "Full Moon"
              ? `${moonPhase.phaseName} (${moonPhase.phase.toFixed(
                  1
                )}% illuminated)`
              : ""
          }
          ${aspects.length > 0 ? aspects.join("\n") : ""}`,
          },
        ],
      });

      // Add emoji forecast
      const emojiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Based on these astrological events, respond with exactly 5 relevant emojis.",
          },
          {
            role: "user",
            content: response.choices[0].message.content!,
          },
        ],
      });

      res.json({
        date,
        planets: planetData,
        moonData: {
          phase: moonPhase,
          position: planetData.find((p: PlanetData) => p.name === "Moon"),
        },
        events,
        aspects,
        forecast: response.choices[0].message.content!.trim(),
        emojiForecast: emojiResponse.choices[0].message.content!.trim(),
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
