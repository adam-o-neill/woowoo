const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateDailyInsights = async (natalChart, currentTransits) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert astrologer specializing in daily forecasts. 
          Always return responses in the exact JSON structure provided, with no additional fields.`,
        },
        {
          role: "user",
          content: `Based on this natal chart and current transits, generate personalized daily insights:
          Natal Chart: ${JSON.stringify(natalChart)}
          Current Transits: ${JSON.stringify(currentTransits)}
          
          Return the response in this exact JSON structure:
          {
            "daily_horoscope": "A detailed daily horoscope prediction",
            "emotional_forecast": {
              "insight": "An analysis of emotional energies for the day",
              "emoji": "3-5 relevant emojis that capture the emotional tone"
            },
            "moon_phase_insights": {
              "phase": "${currentTransits.moonPhase.name}",
              "insight": "Specific insights about how this moon phase affects the day"
            },
            "activity_suggestions": [
              "3-4 specific activity suggestions",
              "based on the current transits",
              "and natal chart aspects"
            ]
          }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content);

    // Validate the response structure matches our interface
    const validatedResponse = {
      daily_horoscope:
        parsedResponse.daily_horoscope ||
        "Unable to generate horoscope at this time.",
      emotional_forecast: {
        insight:
          parsedResponse.emotional_forecast?.insight ||
          "Unable to generate emotional forecast.",
        emoji: parsedResponse.emotional_forecast?.emoji || "",
      },
      moon_phase_insights: {
        phase:
          parsedResponse.moon_phase_insights?.phase ||
          currentTransits.moonPhase.name,
        insight:
          parsedResponse.moon_phase_insights?.insight ||
          "Unable to generate moon phase insights.",
      },
      activity_suggestions: Array.isArray(parsedResponse.activity_suggestions)
        ? parsedResponse.activity_suggestions
        : [
            "Take time for self-reflection",
            "Practice grounding exercises",
            "Connect with loved ones",
          ],
    };
    return validatedResponse;
  } catch (error) {
    console.error("Error generating daily insights:", error);
    // Return a fallback response that matches the interface
    return {
      daily_horoscope:
        "Unable to generate horoscope at this time. Please try again later.",
      emotional_forecast: {
        insight:
          "Temporary technical difficulties in generating your emotional forecast.",
        emoji: "🤔",
      },
      moon_phase_insights: {
        phase: currentTransits.moonPhase.name || "Unknown",
        insight: "Moon phase insights temporarily unavailable.",
      },
      activity_suggestions: [
        "Take some time for self-reflection",
        "Practice grounding exercises",
        "Connect with loved ones",
      ],
    };
  }
};

module.exports = {
  generateDailyInsights,
  openai,
};
