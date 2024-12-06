const express = require("express");
const { authenticateApiKey } = require("../middleware/auth");
const { validateDateParam } = require("../middleware/validation");
const {
  calculatePlanetPositions,
  getMoonPhase,
  getSignificantAspects,
  getAstrologicalEvents,
} = require("../utils/astrology");
const { openai } = require("../utils/openai");

const router = express.Router();

router.get(
  "/astrological-forecast-by-date",
  validateDateParam,
  async (req, res) => {
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
          ${events.map((event) => event.description).join("\n")}
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
            content: response.choices[0].message.content,
          },
        ],
      });

      res.json({
        date,
        planets: planetData,
        moonData: {
          phase: moonPhase,
          position: planetData.find((p) => p.name === "Moon"),
        },
        events,
        aspects,
        forecast: response.choices[0].message.content.trim(),
        emojiForecast: emojiResponse.choices[0].message.content.trim(),
      });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/astrological-forecast-10-days", async (req, res) => {
  try {
    const today = new Date();
    const forecasts = [];

    for (let i = 0; i < 3; i++) {
      try {
        const jsDate = new Date(today);
        jsDate.setDate(today.getDate() + i); // Increment day by day

        const hour =
          jsDate.getHours() +
          jsDate.getMinutes() / 60 +
          jsDate.getSeconds() / 3600;

        // Calculate Julian Day
        const jd = sweph.julday(
          jsDate.getFullYear(),
          jsDate.getMonth() + 1, // Months are 0-indexed in JS Date
          jsDate.getDate(),
          hour,
          sweph.constants.SE_GREG_CAL // Gregorian calendar
        );

        const iflag = sweph.constants.SEFLG_SWIEPH;

        // Planets to calculate
        const planets = [
          { name: "Sun", id: sweph.constants.SE_SUN },
          { name: "Moon", id: sweph.constants.SE_MOON },
          { name: "Mercury", id: sweph.constants.SE_MERCURY },
          { name: "Venus", id: sweph.constants.SE_VENUS },
          { name: "Mars", id: sweph.constants.SE_MARS },
          { name: "Jupiter", id: sweph.constants.SE_JUPITER },
          { name: "Saturn", id: sweph.constants.SE_SATURN },
          { name: "Uranus", id: sweph.constants.SE_URANUS },
          { name: "Neptune", id: sweph.constants.SE_NEPTUNE },
          { name: "Pluto", id: sweph.constants.SE_PLUTO },
        ];

        // Calculate positions and zodiac signs
        const planetData = planets.map((planet) => {
          const result = sweph.calc_ut(jd, planet.id, iflag);
          return {
            name: planet.name,
            longitude: result.data[0],
            latitude: result.data[1],
            distance: result.data[2],
            zodiacSign: getZodiacSign(result.data[0]),
          };
        });

        // Prepare the OpenAI prompt
        const prompt = `
          Generate an extremely concise astrological forecast for the following data:
          Date: ${jsDate.toISOString().split("T")[0]}
          ${planetData
            .map(
              (planet) =>
                `${planet.name} is in ${
                  planet.zodiacSign
                } at ${planet.longitude.toFixed(2)}°`
            )
            .join("\n")}.
          Focus on concise guidance and overall vibe for the day. Don't use markdown. Tone should be calm and impartial.
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });

        const emojiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Based on the following astrological reading, respond solely with 5 emojis that represent the reading.",
            },
            { role: "user", content: response.choices[0].message.content },
          ],
        });

        forecasts.push({
          date: jsDate.toISOString().split("T")[0],
          planets: planetData,
          forecast: response.choices[0].message,
          emojiForecast: emojiResponse.choices[0].message,
        });
      } catch (dayError) {
        console.error(`Error processing day ${i}:`, dayError.message);
        forecasts.push({
          date: jsDate.toISOString().split("T")[0],
          error: dayError.message,
        });
      }
    }

    res.json({ forecasts });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/astrological-forecast", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date query parameter is required." });
  }

  try {
    const jsDate = new Date(date);
    const hour =
      jsDate.getHours() + jsDate.getMinutes() / 60 + jsDate.getSeconds() / 3600;

    // Calculate Julian Day
    const jd = sweph.julday(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1, // Months are 0-indexed in JS Date
      jsDate.getDate(),
      hour,
      sweph.constants.SE_GREG_CAL // Gregorian calendar
    );

    const iflag = sweph.constants.SEFLG_SWIEPH;

    // Planets to calculate
    const planets = [
      { name: "Sun", id: sweph.constants.SE_SUN },
      { name: "Moon", id: sweph.constants.SE_MOON },
      { name: "Mercury", id: sweph.constants.SE_MERCURY },
      { name: "Venus", id: sweph.constants.SE_VENUS },
      { name: "Mars", id: sweph.constants.SE_MARS },
      { name: "Jupiter", id: sweph.constants.SE_JUPITER },
      { name: "Saturn", id: sweph.constants.SE_SATURN },
      { name: "Uranus", id: sweph.constants.SE_URANUS },
      { name: "Neptune", id: sweph.constants.SE_NEPTUNE },
      { name: "Pluto", id: sweph.constants.SE_PLUTO },
    ];

    // Calculate positions and zodiac signs
    const planetData = planets.map((planet) => {
      const result = sweph.calc_ut(jd, planet.id, iflag);
      return {
        name: planet.name,
        longitude: result.data[0],
        latitude: result.data[1],
        distance: result.data[2],
        zodiacSign: getZodiacSign(result.data[0]),
      };
    });

    // Prepare the OpenAI prompt
    const prompt = `
      Generate an engaging astrological forecast for the following data using only emojis and concise language:
      Date: ${date}
      ${planetData
        .map(
          (planet) =>
            `${planet.name} is in ${
              planet.zodiacSign
            } at ${planet.longitude.toFixed(2)}°`
        )
        .join("\n")}.
      Focus on key themes, relationships between planets, and overall guidance for the day.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        // { role: "system", content: prompt },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Return the forecast
    res.json({
      date,
      planets: planetData,
      forecast: response.choices[0].message,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
