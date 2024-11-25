require("dotenv").config();
const express = require("express");
const { Configuration, OpenAI } = require("openai");
const swe = require("sweph");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Set up OpenAI configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set the path to the Swiss Ephemeris files
swe.set_ephe_path("./ephemeris_files");
console.log("Ephemeris Path Set To:", swe.get_library_path());

// Define planets array at the top level
const planets = [
  { name: "Sun", id: swe.constants.SE_SUN },
  { name: "Moon", id: swe.constants.SE_MOON },
  { name: "Mercury", id: swe.constants.SE_MERCURY },
  { name: "Venus", id: swe.constants.SE_VENUS },
  { name: "Mars", id: swe.constants.SE_MARS },
  { name: "Jupiter", id: swe.constants.SE_JUPITER },
  { name: "Saturn", id: swe.constants.SE_SATURN },
  { name: "Uranus", id: swe.constants.SE_URANUS },
  { name: "Neptune", id: swe.constants.SE_NEPTUNE },
  { name: "Pluto", id: swe.constants.SE_PLUTO },
];

// Helper function: Map longitude to zodiac sign
const getZodiacSign = (longitude) => {
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
  return signs[Math.floor(longitude / 30)];
};

// Add this helper function to analyze planetary aspects
const getSignificantAspects = (planetData) => {
  const aspects = [];
  for (let i = 0; i < planetData.length; i++) {
    for (let j = i + 1; j < planetData.length; j++) {
      const angle = Math.abs(planetData[i].longitude - planetData[j].longitude);
      const orb = 5; // degrees of allowance

      // Check for major aspects
      if (Math.abs(angle - 0) <= orb || Math.abs(angle - 360) <= orb)
        aspects.push(`${planetData[i].name} conjunct ${planetData[j].name}`);
      if (Math.abs(angle - 90) <= orb)
        aspects.push(`${planetData[i].name} square ${planetData[j].name}`);
      if (Math.abs(angle - 180) <= orb)
        aspects.push(`${planetData[i].name} opposite ${planetData[j].name}`);
      if (Math.abs(angle - 120) <= orb)
        aspects.push(`${planetData[i].name} trine ${planetData[j].name}`);
    }
  }
  return aspects;
};

// Add these helper functions at the top with your other helpers
const getMoonPhase = (jd) => {
  // Calculate moon phase (0-1)
  const result = swe.calc_ut(
    jd,
    swe.constants.SE_MOON,
    swe.constants.SEFLG_SWIEPH
  );
  const sunResult = swe.calc_ut(
    jd,
    swe.constants.SE_SUN,
    swe.constants.SEFLG_SWIEPH
  );

  // Calculate the difference between moon and sun longitudes
  let phase = (result.data[0] - sunResult.data[0]) / 360;
  if (phase < 0) phase += 1;

  // Get moon age in days (0-29.5)
  const moonAge = phase * 29.53;

  // Determine phase name
  let phaseName;
  if (moonAge < 1.84566) phaseName = "New Moon";
  else if (moonAge < 5.53699) phaseName = "Waxing Crescent";
  else if (moonAge < 9.22831) phaseName = "First Quarter";
  else if (moonAge < 12.91963) phaseName = "Waxing Gibbous";
  else if (moonAge < 16.61096) phaseName = "Full Moon";
  else if (moonAge < 20.30228) phaseName = "Waning Gibbous";
  else if (moonAge < 23.99361) phaseName = "Last Quarter";
  else if (moonAge < 27.68493) phaseName = "Waning Crescent";
  else phaseName = "New Moon";

  return {
    phase: phase * 100, // percentage
    age: moonAge,
    phaseName,
  };
};

// Add helper to detect sign changes and other significant events
const getAstrologicalEvents = (planetData, date) => {
  const events = [];
  const jsDate = new Date(date);

  // Check yesterday's positions to detect sign changes
  const yesterdayDate = new Date(jsDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayJd = swe.julday(
    yesterdayDate.getFullYear(),
    yesterdayDate.getMonth() + 1,
    yesterdayDate.getDate(),
    0,
    swe.constants.SE_GREG_CAL
  );

  planets.forEach((planet) => {
    const yesterdayResult = swe.calc_ut(
      yesterdayJd,
      planet.id,
      swe.constants.SEFLG_SWIEPH
    );
    const yesterdaySign = getZodiacSign(yesterdayResult.data[0]);
    const todaySign = planetData.find((p) => p.name === planet.name).zodiacSign;

    if (yesterdaySign !== todaySign) {
      events.push({
        type: "ingress",
        description: `${planet.name} enters ${todaySign}`,
        significance:
          planet.name === "Sun"
            ? `${todaySign} season begins (lasts ~30 days)`
            : `${planet.name}'s influence takes on ${todaySign} qualities`,
      });
    }
  });

  return events;
};

// Add necessary security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
  })
);

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  methods: ["GET"], // Only allow GET methods
  allowedHeaders: ["Content-Type", "x-api-key"],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
  trustProxy: true,
});
app.use(limiter);

// Add API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
app.use(authenticateApiKey);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const validateDateParam = (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  // Optional: Limit date range
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (parsedDate < minDate || parsedDate > maxDate) {
    return res
      .status(400)
      .json({ error: "Date must be within one year of current date" });
  }

  next();
};

app.get(
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
      const hour =
        jsDate.getHours() +
        jsDate.getMinutes() / 60 +
        jsDate.getSeconds() / 3600;
      const jd = swe.julday(
        jsDate.getFullYear(),
        jsDate.getMonth() + 1,
        jsDate.getDate(),
        hour,
        swe.constants.SE_GREG_CAL
      );

      const iflag = swe.constants.SEFLG_SWIEPH;

      // Calculate positions using the shared planets array
      const planetData = planets.map((planet) => {
        const result = swe.calc_ut(jd, planet.id, iflag);
        return {
          name: planet.name,
          longitude: result.data[0],
          latitude: result.data[1],
          distance: result.data[2],
          zodiacSign: getZodiacSign(result.data[0]),
        };
      });

      const moonPhase = getMoonPhase(jd);
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

app.get("/astrological-forecast-10-days", async (req, res) => {
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
        const jd = swe.julday(
          jsDate.getFullYear(),
          jsDate.getMonth() + 1, // Months are 0-indexed in JS Date
          jsDate.getDate(),
          hour,
          swe.constants.SE_GREG_CAL // Gregorian calendar
        );
        console.log(`Day ${i}: Julian Day = ${jd}`);

        const iflag = swe.constants.SEFLG_SWIEPH;

        // Planets to calculate
        const planets = [
          { name: "Sun", id: swe.constants.SE_SUN },
          { name: "Moon", id: swe.constants.SE_MOON },
          { name: "Mercury", id: swe.constants.SE_MERCURY },
          { name: "Venus", id: swe.constants.SE_VENUS },
          { name: "Mars", id: swe.constants.SE_MARS },
          { name: "Jupiter", id: swe.constants.SE_JUPITER },
          { name: "Saturn", id: swe.constants.SE_SATURN },
          { name: "Uranus", id: swe.constants.SE_URANUS },
          { name: "Neptune", id: swe.constants.SE_NEPTUNE },
          { name: "Pluto", id: swe.constants.SE_PLUTO },
        ];

        // Calculate positions and zodiac signs
        const planetData = planets.map((planet) => {
          const result = swe.calc_ut(jd, planet.id, iflag);
          return {
            name: planet.name,
            longitude: result.data[0],
            latitude: result.data[1],
            distance: result.data[2],
            zodiacSign: getZodiacSign(result.data[0]),
          };
        });

        console.log(`Day ${i}: Planetary Data =`, planetData);

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

        console.log(`Day ${i}: Forecast =`, response.choices[0].message);

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

// Endpoint: Generate an astrological forecast
app.get("/astrological-forecast", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date query parameter is required." });
  }

  try {
    const jsDate = new Date(date);
    const hour =
      jsDate.getHours() + jsDate.getMinutes() / 60 + jsDate.getSeconds() / 3600;

    // Calculate Julian Day
    const jd = swe.julday(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1, // Months are 0-indexed in JS Date
      jsDate.getDate(),
      hour,
      swe.constants.SE_GREG_CAL // Gregorian calendar
    );
    console.log("Julian Day:", jd);

    const iflag = swe.constants.SEFLG_SWIEPH;

    // Planets to calculate
    const planets = [
      { name: "Sun", id: swe.constants.SE_SUN },
      { name: "Moon", id: swe.constants.SE_MOON },
      { name: "Mercury", id: swe.constants.SE_MERCURY },
      { name: "Venus", id: swe.constants.SE_VENUS },
      { name: "Mars", id: swe.constants.SE_MARS },
      { name: "Jupiter", id: swe.constants.SE_JUPITER },
      { name: "Saturn", id: swe.constants.SE_SATURN },
      { name: "Uranus", id: swe.constants.SE_URANUS },
      { name: "Neptune", id: swe.constants.SE_NEPTUNE },
      { name: "Pluto", id: swe.constants.SE_PLUTO },
    ];

    // Calculate positions and zodiac signs
    const planetData = planets.map((planet) => {
      const result = swe.calc_ut(jd, planet.id, iflag);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
