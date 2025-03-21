import express, { Request, Response } from "express";
import { authenticateUser } from "../auth/supabase";
import { openai } from "../utils/openai";
import { db } from "../db";
import { birthChart, scenarioResponse } from "../db/schema";
import { eq, and } from "drizzle-orm";

const router = express.Router();

interface ChartData {
  timestamp: string;
  houses: number[];
  ascendant: number;
  midheaven: number;
  descendant: number;
  planets: {
    name: string;
    zodiacSign: string;
    longitude: number;
  }[];
  aspects: string[];
}

interface ScenarioRequest {
  scenario: {
    id: string;
    prompt: string;
  };
  userBirthInfoId: string;
}

function formatChartDataForAI(chartData: string): string {
  const data: ChartData = JSON.parse(chartData);

  // Format houses
  const houses = data.houses
    .map((degree, index) => {
      return `House ${index + 1}: ${Math.floor(degree)}°`;
    })
    .join("\n");

  // Format important angles
  const angles = {
    Ascendant: Math.floor(data.ascendant),
    Midheaven: Math.floor(data.midheaven),
    Descendant: Math.floor(data.descendant),
  };

  // Format planets
  const planets = data.planets
    .map((planet) => {
      return `${planet.name} in ${planet.zodiacSign} at ${Math.floor(
        planet.longitude
      )}°`;
    })
    .join("\n");

  // Format aspects
  const aspects = data.aspects.join("\n");

  return `BIRTH CHART ANALYSIS

Important Angles:
${Object.entries(angles)
  .map(([angle, degree]) => `${angle}: ${degree}°`)
  .join("\n")}

Planetary Positions:
${planets}

House Cusps:
${houses}

Aspects:
${aspects}`;
}

router.post(
  "/scenarios/activate",
  authenticateUser,
  async (req: Request<{}, {}, ScenarioRequest>, res: Response) => {
    try {
      const { scenario, userBirthInfoId } = req.body;

      // Check if we already have a response for this scenario and birth info
      const existingResponse = await db
        .select()
        .from(scenarioResponse)
        .where(
          and(
            eq(scenarioResponse.scenarioId, scenario.id),
            eq(scenarioResponse.birthInfoId, userBirthInfoId)
          )
        )
        .limit(1);

      if (existingResponse.length > 0) {
        // Return existing response if found
        return res.json({
          scenarioId: scenario.id,
          result: existingResponse[0].response,
        });
      }

      // If no existing response, generate new one
      const chartData = await db
        .select()
        .from(birthChart)
        .where(eq(birthChart.birthInfoId, userBirthInfoId))
        .limit(1);

      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      const formattedChartData = formatChartDataForAI(chartData[0].chartData);

      // Generate OpenAI completion
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert astrologer who provides insightful and specific interpretations based on birth chart data.",
          },
          {
            role: "user",
            content: `${scenario.prompt}\n\n${formattedChartData}`,
          },
        ],
      });

      const generatedResponse = response.choices[0].message.content;

      // Save the response to the database
      await db.insert(scenarioResponse).values({
        scenarioId: scenario.id,
        birthInfoId: userBirthInfoId,
        response: generatedResponse,
      });

      res.json({
        scenarioId: scenario.id,
        result: generatedResponse,
      });
    } catch (error) {
      console.error("Scenario activation error:", error);
      res.status(500).json({ error: "Failed to process scenario" });
    }
  }
);

export default router;
