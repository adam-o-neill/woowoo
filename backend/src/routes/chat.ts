import express from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { person, birthChart, birthInfo, relationship } from "../db/schema";
import { eq, and } from "drizzle-orm";
import {
  calculateCurrentTransits,
  getCurrentAstrologicalEvents,
  getAstrologicalEventsForDate,
  getFavorableDatesForActivity,
  parseDateQuery,
  calculateMoonPhase,
} from "../utils/astrology";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
router.post("/chat", authenticateUser, async (req: any, res: any) => {
  try {
    const { message, connectionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`Chat request received: "${message.substring(0, 50)}..."`);

    // Parse date-related queries
    const dateQueryInfo = parseDateQuery(message);

    // Get the user's birth chart data
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    let userBirthInfo = null;
    let userChartData = null;

    if (userPerson[0].birthInfoId) {
      userBirthInfo = await db
        .select()
        .from(birthInfo)
        .where(eq(birthInfo.id, userPerson[0].birthInfoId))
        .limit(1);

      if (userBirthInfo && userBirthInfo.length > 0) {
        const userChart = await db
          .select()
          .from(birthChart)
          .where(eq(birthChart.birthInfoId, userBirthInfo[0].id))
          .limit(1);

        if (userChart && userChart.length > 0) {
          userChartData = JSON.parse(userChart[0].chartData);
        }
      }
    }

    // If connectionId is provided, get the friend's birth chart data
    let friendData = null;
    let friendChartData = null;
    let relationshipType = null;

    if (connectionId) {
      // Get relationship info
      const relationshipData = await db
        .select()
        .from(relationship)
        .where(eq(relationship.id, connectionId))
        .limit(1);

      if (relationshipData && relationshipData.length > 0) {
        relationshipType = relationshipData[0].type;

        // Get friend's person record
        const friendPerson = await db
          .select()
          .from(person)
          .where(eq(person.id, relationshipData[0].relatedPersonId))
          .limit(1);

        if (friendPerson && friendPerson.length > 0) {
          friendData = friendPerson[0];

          if (friendPerson[0].birthInfoId) {
            // Get friend's birth info
            const friendBirthInfo = await db
              .select()
              .from(birthInfo)
              .where(eq(birthInfo.id, friendPerson[0].birthInfoId))
              .limit(1);

            if (friendBirthInfo && friendBirthInfo.length > 0) {
              // Get friend's chart data
              const friendChart = await db
                .select()
                .from(birthChart)
                .where(eq(birthChart.birthInfoId, friendBirthInfo[0].id))
                .limit(1);

              if (friendChart && friendChart.length > 0) {
                friendChartData = JSON.parse(friendChart[0].chartData);
              }
            }
          }
        }
      }
    }

    // Get current astrological events for today by default
    let currentEvents = await getCurrentAstrologicalEvents(new Date());
    console.log("currentEvents", currentEvents);
    console.log("dateQueryInfo", dateQueryInfo);
    // If the user is asking about a specific date, get events for that date
    if (dateQueryInfo.isDateQuery) {
      if (dateQueryInfo.targetDate) {
        // Get events for a specific date with more comprehensive information
        currentEvents = await getAstrologicalEventsForDate(
          dateQueryInfo.targetDate
        );

        // Add moon phase information
        const moonPhase = await calculateMoonPhase(dateQueryInfo.targetDate);
        currentEvents.push({
          type: "moon_phase",
          name: moonPhase.name,
          description: `Moon is in ${
            moonPhase.name
          } phase (${moonPhase.percentage.toFixed(1)}% illumination)`,
          date: dateQueryInfo.targetDate.toISOString(),
          significance: getMoonPhaseSignificance(moonPhase.name),
        });

        // Get current transits for that date
        const transits = await calculateCurrentTransits(
          dateQueryInfo.targetDate,
          userChartData
        );

        // Add significant transit aspects
        if (transits && transits.aspects) {
          const significantAspects = transits.aspects
            .filter((aspect: any) =>
              [
                "conjunction",
                "opposition",
                "square",
                "trine",
                "sextile",
              ].includes(aspect.aspectType)
            )
            .slice(0, 5); // Limit to 5 most important aspects

          significantAspects.forEach((aspect: any) => {
            currentEvents.push({
              type: "transit_aspect",
              name: `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2}`,
              description: `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2}`,
              date: dateQueryInfo?.targetDate?.toISOString() || "",
              significance: getAspectSignificance(
                aspect.planet1,
                aspect.aspectType,
                aspect.planet2
              ),
            });
          });
        }
      } else if (dateQueryInfo.activityQuery && dateQueryInfo.dateRange) {
        // Get favorable dates for an activity
        const favorableDates = await getFavorableDatesForActivity(
          dateQueryInfo.activityQuery,
          dateQueryInfo.dateRange.start,
          dateQueryInfo.dateRange.end
        );

        // Add this to the current events to be included in the prompt

        currentEvents.push({
          type: "favorable_dates",
          // @ts-ignore
          activity: dateQueryInfo.activityQuery,
          dates: favorableDates,
          description: `Favorable dates for ${dateQueryInfo.activityQuery}`,
          significance: "Based on planetary alignments and moon phases",
        });
      }
    }

    console.log("currentEvents", currentEvents);

    // First, analyze the user's question to determine response style
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an astrology AI assistant. Analyze the user's question and determine:
1. Tone (professional, serious, educational, casual, mystical)
2. Complexity level (simple, moderate, detailed)
3. Response length (brief, moderate, comprehensive)
4. Focus area (natal chart, compatibility, prediction, general astrology, personal advice, date-specific)
5. Emotional state (curious, anxious, excited, skeptical, neutral)
6. Is the user asking about current astrological events or influences? (yes/no)
7. Is the user asking about a specific date or time period? (yes/no)
8. Is the user asking for favorable dates for an activity? (yes/no)

When in doubt, prefer professional and serious tones. Prioritize accuracy and clarity over mystical language.
Return your analysis as a JSON object with these fields.`,
        },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisText = analysisResponse.choices[0].message.content;
    if (!analysisText) {
      throw new Error("Failed to analyze question");
    }

    const analysis = JSON.parse(analysisText);
    console.log("Question analysis:", analysis);

    // Now generate the actual response based on the analysis
    const systemPrompt = generateSystemPrompt(
      analysis,
      userChartData,
      friendData,
      friendChartData,
      relationshipType,
      currentEvents,
      dateQueryInfo
    );

    console.log("systemPrompt", systemPrompt);

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.3, // Fixed lower temperature for professional responses
      max_tokens: getMaxTokensForLength(analysis.responseLength),
    });

    const response = chatResponse.choices[0].message.content;
    console.log("Chat response:", response);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// Helper function to generate system prompt based on analysis
function generateSystemPrompt(
  analysis: any,
  userChartData: any,
  friendData: any,
  friendChartData: any,
  relationshipType: string | null,
  currentEvents: any[],
  dateQueryInfo: any
) {
  // Base prompt with professional astrology knowledge but more flexibility
  let prompt = `You are a professional astrologer with expertise in natal charts, transits, and compatibility analysis. `;
  prompt += `While you primarily provide accurate, evidence-based astrological interpretations, you can also be creative and engaging when appropriate. `;
  prompt += `Focus on practical insights and clear explanations, but don't be afraid to use storytelling when it helps illustrate astrological concepts. `;

  // Adjust tone based on analysis
  if (analysis.tone === "casual" || analysis.tone === "mystical") {
    prompt += `Use a ${analysis.tone} tone that's engaging and accessible. `;
    prompt += `You can be more imaginative and use metaphors or storytelling when it enhances the user experience. `;
  } else {
    prompt += `Maintain a professional, authoritative tone throughout your response. `;
    prompt += `Be precise and factual, but not overly rigid or restrictive. `;
  }

  prompt += `Present astrological concepts as tools for self-understanding rather than as absolute deterministic forces. `;

  // Add complexity instructions based on analysis but with professional focus
  switch (analysis.complexity) {
    case "simple":
      prompt += `Explain concepts clearly without unnecessary jargon, but don't oversimplify to the point of inaccuracy. `;
      break;
    case "moderate":
      prompt += `Use appropriate astrological terminology with brief explanations where needed. `;
      break;
    case "detailed":
      prompt += `Provide detailed technical analysis with proper astrological terminology. `;
      break;
    default:
      prompt += `Balance technical accuracy with accessibility. `;
  }

  // Add user chart data if available
  if (userChartData) {
    prompt += `\n\nThe user has the following birth chart data: ${JSON.stringify(
      userChartData
    )}. `;
  } else {
    prompt += `\n\nThe user has not provided their birth chart data. `;
  }

  // Add friend data if available
  if (friendData && friendChartData) {
    prompt += `\n\nThe user is asking about ${friendData.name}, who is their ${
      relationshipType || "friend"
    }. `;
    prompt += `${friendData.name}'s birth chart data: ${JSON.stringify(
      friendChartData
    )}. `;

    // If both charts are available, mention compatibility
    if (userChartData) {
      prompt += `\n\nYou can analyze compatibility between the user and ${friendData.name} based on their charts. `;
      prompt += `This can include practical relationship dynamics, potential challenges, strengths, and even creative storytelling about their connection if requested. `;
    }
  }

  // Add date-specific information if the user is asking about a specific date
  if (dateQueryInfo.isDateQuery) {
    if (dateQueryInfo.targetDate) {
      prompt += `\n\nThe user is asking about astrological events or influences for a specific date: ${
        dateQueryInfo.targetDate.toISOString().split("T")[0]
      }. `;
    } else if (dateQueryInfo.dateRange) {
      prompt += `\n\nThe user is asking about astrological events or influences for a date range: ${
        dateQueryInfo.dateRange.start.toISOString().split("T")[0]
      } to ${dateQueryInfo.dateRange.end.toISOString().split("T")[0]}. `;
    }

    if (dateQueryInfo.activityQuery) {
      prompt += `\nSpecifically, they want to know about favorable dates for: ${dateQueryInfo.activityQuery}. `;
    }
  }

  // Add current astrological events
  if (currentEvents && currentEvents.length > 0) {
    prompt += `\n\nAstrological events that may be relevant to the user's question: ${JSON.stringify(
      currentEvents
    )}. `;

    // If the user is specifically asking about current events
    if (
      analysis.focusArea === "current events" ||
      analysis.askingAboutCurrentEvents === true
    ) {
      prompt += `\nThe user appears to be asking about current astrological events. Prioritize explaining these events and their effects in your response. `;
    }

    // If there are favorable dates for an activity
    const favorableDatesEvent = currentEvents.find(
      (event) => event.type === "favorable_dates"
    );
    if (favorableDatesEvent) {
      prompt += `\nThe user is asking about favorable dates for ${favorableDatesEvent.activity}. Provide specific date recommendations with astrological reasoning. `;
    }
  }

  // Creative and flexible response guidelines
  prompt += `\n\nAdhere to these guidelines in your response:`;
  prompt += `\n1. Be responsive to the user's specific request, even if it's creative or unusual`;
  prompt += `\n2. Use evidence-based astrological interpretations as a foundation`;
  prompt += `\n3. Feel free to use storytelling, metaphors, or creative formats when appropriate`;
  prompt += `\n4. Present information in a structured, organized manner`;
  prompt += `\n5. Use markdown formatting for clarity and readability`;
  prompt += `\n6. Avoid being overly restrictive or rigid in your responses`;
  prompt += `\n7. Focus on empowering and engaging the user`;

  // Special instructions for creative requests
  prompt += `\n\nIf the user asks for creative content like a love story, narrative, or imaginative interpretation:`;
  prompt += `\n1. Feel free to create this content based on the astrological data`;
  prompt += `\n2. Use the planetary positions and aspects as inspiration for your storytelling`;
  prompt += `\n3. Balance creativity with astrological accuracy`;
  prompt += `\n4. Embrace the request rather than refusing it`;

  // Final instructions
  prompt += `\n\nRespond to the user's question with professional astrological analysis, creative storytelling, or whatever approach best serves their request. Use markdown formatting for better readability.`;

  return prompt;
}

// Helper function to determine max tokens based on desired length
function getMaxTokensForLength(length: string): number {
  switch (length) {
    case "brief":
      return 300;
    case "moderate":
      return 800;
    case "comprehensive":
      return 1500;
    default:
      return 800; // Default to moderate
  }
}

// Helper function to get moon phase significance
function getMoonPhaseSignificance(phaseName: string) {
  const significances: { [key: string]: string } = {
    "New Moon": "New beginnings, setting intentions, starting fresh projects",
    "Waxing Crescent": "Building momentum, taking initial steps, growth",
    "First Quarter": "Taking action, making decisions, overcoming challenges",
    "Waxing Gibbous": "Refining, adjusting, preparing for culmination",
    "Full Moon": "Culmination, realization, heightened emotions, clarity",
    "Waning Gibbous": "Gratitude, sharing, distributing knowledge",
    "Last Quarter": "Release, letting go, forgiveness, clearing space",
    "Waning Crescent": "Surrender, rest, reflection, preparation for renewal",
  };

  return (
    significances[phaseName] || "Lunar energy affecting emotions and intuition"
  );
}

// Helper function to get aspect significance
function getAspectSignificance(
  planet1: string,
  aspectType: string,
  planet2: string
) {
  const aspectMeanings: { [key: string]: string } = {
    conjunction: "merging energies, intensification, new cycle beginning",
    opposition: "tension, awareness, balance, relationship dynamics",
    square: "challenge, conflict, motivation for change, growth opportunity",
    trine: "harmony, flow, ease, creative expression, opportunity",
    sextile: "opportunity, ease with effort, learning, positive connection",
  };

  return `${planet1} and ${planet2} energies are in ${aspectType} (${aspectMeanings[aspectType]})`;
}

export default router;
