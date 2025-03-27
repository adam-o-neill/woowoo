import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add this function to extract relevant astrological data
const extractRelevantAstroData = (natalChart: any, currentTransits: any) => {
  console.log("Checking natal chart structure:", {
    hasNatalPlanets: Boolean(natalChart?.planets),
    planetsLength: natalChart?.planets?.length,
  });

  // Validate input data
  if (!natalChart?.planets || !Array.isArray(natalChart.planets)) {
    throw new Error("Invalid natal chart data: missing planets array");
  }

  if (!currentTransits?.planets || !Array.isArray(currentTransits.planets)) {
    throw new Error("Invalid current transits data: missing planets array");
  }

  // Significant transits (filter by importance)
  const significantTransits = currentTransits.aspects.filter((aspect: any) => {
    // Keep only important aspects
    const majorAspects = ["conjunction", "opposition", "trine", "square"];
    const significantPlanets = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
    ];

    return (
      majorAspects.includes(aspect.aspect) &&
      significantPlanets.includes(aspect.transitPlanet) &&
      significantPlanets.includes(aspect.natalPlanet) &&
      Math.abs(aspect.orb) < 5
    );
  });

  // Find planets in natal chart and get their signs
  const natalSun = natalChart.planets.find((p: any) => p.name === "Sun");
  const natalMoon = natalChart.planets.find((p: any) => p.name === "Moon");

  if (!natalSun || !natalMoon) {
    throw new Error(
      "Missing required planets in natal chart: " +
        (!natalSun ? "Sun " : "") +
        (!natalMoon ? "Moon" : "")
    );
  }

  const astroData = {
    // Basic birth info
    natalSun: natalSun.zodiacSign || getZodiacSign(natalSun.longitude),
    natalMoon: natalMoon.zodiacSign || getZodiacSign(natalMoon.longitude),
    natalAscendant: getZodiacSign(natalChart.ascendant),

    // Current transiting positions
    currentMoonSign: currentTransits.planets.find((p: any) => p.name === "Moon")
      ?.zodiacSign,
    currentMoonPhase: currentTransits.moonPhase?.name,

    // Key transits affecting the person today
    significantTransits: significantTransits.map((t: any) => ({
      transit: `${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet}`,
      orb: Math.round(t.orb * 10) / 10,
    })),

    // Mercury retrograde and other special conditions
    specialConditions: getSpecialConditions(currentTransits),
  };

  console.log("Extracted astro data:", astroData);
  return astroData;
};

// Helper to get zodiac sign from longitude
const getZodiacSign = (longitude: any) => {
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
  return signs[Math.floor(longitude / 30) % 12];
};

// Helper to detect special conditions
const getSpecialConditions = (transits: any) => {
  const conditions = [];

  // Check Mercury retrograde
  const mercury = transits.planets.find((p: any) => p.name === "Mercury");
  if (mercury && mercury.longitudeSpeed < 0) {
    conditions.push("Mercury retrograde");
  }

  // Add other special conditions
  if (
    transits.moonPhase.name === "New Moon" ||
    transits.moonPhase.name === "Full Moon"
  ) {
    conditions.push(transits.moonPhase.name);
  }

  return conditions;
};

const generateDailyInsights = async (natalChart: any, currentTransits: any) => {
  try {
    const astroData = extractRelevantAstroData(natalChart, currentTransits);

    // Step 1: Get astrological interpretation
    const interpretationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a practical astrologer who focuses on concrete themes and real-world situations. " +
            "Analyze the chart and transits to identify the most prominent challenge, opportunity, or dynamic at play today. " +
            "Be specific and grounded - what's actually happening in their life right now?",
        },
        {
          role: "user",
          content: `Based on these aspects, what's the most significant dynamic or situation this person is dealing with today? ${JSON.stringify(
            astroData,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.7,
    });

    // Step 2: Transform interpretation into wisdom with more variety and directness
    const wisdomResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a blunt, no-nonsense astrologer who delivers sharp, direct insights. " +
            "Your advice must be extremely concise - no more than 5-7 words when possible. " +
            "Be provocative, counterintuitive, and memorable. " +
            "Avoid all clichés about emotional turmoil and generic spiritual advice. " +
            "Examples: " +
            "'Don't text them.' " +
            "'Self-righteousness won't help you today.' " +
            "'The apology you're waiting for will never come.' " +
            "'Your fear of rejection is costing you more than rejection would.' " +
            "'That thing you're overthinking? It's not that deep.' " +
            "'The answer is in your notes app and you know it.' " +
            "'Stop rehearsing conversations that will never happen.' " +
            "'Your intuition isn't wrong, your interpretation is.'",
        },
        {
          role: "user",
          content: `Given this situation: "${interpretationResponse.choices[0].message.content}" 
            Create a single, sharp concise insight that cuts to the heart of the matter. Be direct, specific, and avoid generic emotional advice.`,
        },
      ],
      temperature: 1.0, // Maximum variety
      max_tokens: 25, // Very short response
    });

    return {
      daily_horoscope:
        wisdomResponse.choices[0].message.content ||
        "Unable to generate insight at this time.",
    };
  } catch (error) {
    console.error("Error generating daily insights:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return {
      daily_horoscope:
        "Unable to generate horoscope at this time. Please try again later.",
    };
  }
};

export { generateDailyInsights, openai };
