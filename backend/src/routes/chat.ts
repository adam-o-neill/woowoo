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
      return res.status(400).json({ message: "Message is required" });
    }

    // Get the user's person record
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson.length || !userPerson[0].birthInfoId) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Get the user's birth chart
    const userChartData = await db
      .select()
      .from(birthChart)
      .where(eq(birthChart.birthInfoId, userPerson[0].birthInfoId))
      .limit(1);

    if (!userChartData.length) {
      return res.status(404).json({ message: "User chart not found" });
    }

    const userChart = JSON.parse(userChartData[0].chartData);

    // Get friend data if connectionId is provided
    let friendChart = null;
    let friendName = null;

    if (connectionId) {
      // Get the relationship
      const relationshipData = await db
        .select()
        .from(relationship)
        .where(
          and(
            eq(relationship.id, connectionId),
            eq(relationship.personId, userPerson[0].id)
          )
        )
        .limit(1);

      if (relationshipData.length) {
        // Get the related person
        const relatedPerson = await db
          .select()
          .from(person)
          .where(eq(person.id, relationshipData[0].relatedPersonId))
          .limit(1);

        if (relatedPerson.length && relatedPerson[0].birthInfoId) {
          // Get the friend's birth chart
          const friendChartData = await db
            .select()
            .from(birthChart)
            .where(eq(birthChart.birthInfoId, relatedPerson[0].birthInfoId))
            .limit(1);

          if (friendChartData.length) {
            friendChart = JSON.parse(friendChartData[0].chartData);
            friendName = relatedPerson[0].name;
          }
        }
      }
    }

    // For the user's own transits
    const userTransits = calculateCurrentTransits(new Date(), userChart);

    // For the friend's transits (if a friend is selected)
    let friendTransits = null;
    if (friendChart) {
      friendTransits = calculateCurrentTransits(new Date(), friendChart);
    }

    // Create a prompt for the AI
    let systemPrompt = `You are an expert astrologer who analyzes birth charts and provides personal insights based on astrological principles. 
    
Here is the user's birth chart information:
${JSON.stringify(userChart, null, 2)}

Current planetary transits affecting the user:
${JSON.stringify(userTransits, null, 2)}`;

    if (friendChart) {
      systemPrompt += `\n\nHere is ${friendName}'s birth chart information:
${JSON.stringify(friendChart, null, 2)}

Current planetary transits affecting ${friendName}:
${JSON.stringify(friendTransits, null, 2)}`;
    }

    systemPrompt += `\n\nYour task is to answer the user's astrological questions by interpreting these charts. Your answers should:
1. Be personalized to the specific placements in their chart
2. Consider current transits when relevant to their question
3. Be informative and educational about astrological concepts
4. Provide practical insights they can apply
5. If they're asking about compatibility with ${friendName}, analyze both charts together

Format your responses using markdown for better readability:
- Use **bold** for important points
- Use *italics* for emphasis
- Use ## headings for sections
- Use bullet points or numbered lists where appropriate
- Use > blockquotes for special insights

The user will ask you questions about their birth chart, current transits, or compatibility with ${
      friendName || "others"
    }.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Return the AI's response
    res.json({
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
