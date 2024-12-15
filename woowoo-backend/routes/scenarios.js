const express = require("express");
const { authenticateUser } = require("../auth/supabase");
const router = express.Router();
const { openai } = require("../utils/openai");
const { db } = require("../db");
const { birthChart } = require("../db/schema");
const { eq } = require("drizzle-orm");

function formatChartDataForAI(chartData) {
  const data = JSON.parse(chartData);

  // Format birth time and location
  const birthDateTime = new Date(data.timestamp).toLocaleString();
  const location = data.location.place;

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
    "Imum Coeli": Math.floor(data.imumCoeli),
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
  
Time and Location:
Born on ${birthDateTime}
Location: ${location}

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

router.post("/scenarios/activate", authenticateUser, async (req, res) => {
  try {
    const { scenario, userBirthInfoId } = req.body;

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

    res.json({
      scenarioId: scenario.id,
      result: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Scenario activation error:", error);
    res.status(500).json({ error: "Failed to process scenario" });
  }
});

module.exports = router;
