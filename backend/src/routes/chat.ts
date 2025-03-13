import express from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { person, birthChart, birthInfo, relationship } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { calculateCurrentTransits } from "../utils/astrology";
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
4. Focus area (natal chart, compatibility, prediction, general astrology, personal advice)
5. Emotional state (curious, anxious, excited, skeptical, neutral)

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
      relationshipType
    );

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
  relationshipType: string | null
) {
  // Base prompt with professional astrology knowledge
  let prompt = `You are a professional astrologer with expertise in natal charts, transits, and compatibility analysis. `;
  prompt += `Provide accurate, evidence-based astrological interpretations without excessive mystical language. `;
  prompt += `Focus on practical insights and clear explanations. `;

  // Override tone to be more professional regardless of analysis
  prompt += `Maintain a professional, authoritative tone throughout your response. `;
  prompt += `Be precise, factual, and avoid flowery or overly mystical language. `;
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
      prompt += `\n\nYou can analyze compatibility between the user and ${friendData.name} based on their charts. Focus on practical relationship dynamics rather than vague generalizations. `;
    }
  }

  // Professional response guidelines
  prompt += `\n\nAdhere to these professional guidelines in your response:`;
  prompt += `\n1. Be concise and direct - avoid unnecessary elaboration`;
  prompt += `\n2. Use evidence-based astrological interpretations`;
  prompt += `\n3. Acknowledge the limitations of astrological analysis`;
  prompt += `\n4. Present information in a structured, organized manner`;
  prompt += `\n5. Use markdown formatting for clarity and readability`;
  prompt += `\n6. Avoid making absolute predictions about the future`;
  prompt += `\n7. Focus on empowering the user with information rather than telling them what to do`;

  // Final instructions
  prompt += `\n\nRespond to the user's question with professional astrological analysis. Use markdown formatting for better readability.`;

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

export default router;
