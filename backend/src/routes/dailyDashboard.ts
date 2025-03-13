import express, { Request, Response } from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart, person } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { calculateCurrentTransits } from "../utils/astrology";
import { generateDailyInsights } from "../utils/openai";

const router = express.Router();

// Get daily dashboard data for current user
router.get("/daily-dashboard", authenticateUser, async (req: any, res: any) => {
  console.log("Fetching daily dashboard data");
  try {
    // Step 1: Find the person record with a single query that joins all needed data
    const userId = req.user.id;
    console.log("User ID:", userId);

    // Get person record
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, userId))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      console.log("Person not found for user", userId);
      return res.status(404).json({ message: "Person not found" });
    }

    const personId = userPerson[0].id;
    console.log("Person ID:", personId);

    // Check if birth info ID exists
    if (!userPerson[0].birthInfoId) {
      console.log("Birth info ID not found for person", personId);
      return res.status(404).json({ message: "Birth info not found" });
    }

    const birthInfoId = userPerson[0].birthInfoId;
    console.log("Birth info ID:", birthInfoId);

    // Get birth info
    const userBirthInfo = await db
      .select()
      .from(birthInfo)
      .where(eq(birthInfo.id, birthInfoId))
      .limit(1);

    if (!userBirthInfo || userBirthInfo.length === 0) {
      console.log("Birth info not found for ID", birthInfoId);
      return res.status(404).json({ message: "Birth info not found" });
    }

    console.log("Found birth info:", userBirthInfo[0].id);

    // Get birth chart
    const userBirthChart = await db
      .select()
      .from(birthChart)
      .where(eq(birthChart.birthInfoId, birthInfoId))
      .limit(1);

    if (!userBirthChart || userBirthChart.length === 0) {
      console.log("Birth chart not found for birth info", birthInfoId);
      return res.status(404).json({ message: "Birth chart not found" });
    }

    console.log("Found birth chart:", userBirthChart[0].id);

    // Parse chart data
    let chartData;
    try {
      chartData = JSON.parse(userBirthChart[0].chartData);
      console.log("Successfully parsed chart data");
    } catch (error) {
      console.error("Error parsing chart data:", error);
      return res.status(500).json({ message: "Invalid chart data format" });
    }

    // Calculate current transits
    console.log("Calculating current transits...");
    const currentTransits = await calculateCurrentTransits(
      new Date(),
      chartData
    );
    console.log("Transits calculated successfully");

    // Generate personalized insights using OpenAI
    console.log("Generating daily insights...");
    const dailyInsights = await generateDailyInsights(
      chartData,
      currentTransits
    );
    console.log("Insights generated successfully");

    // Return the complete data
    res.json({
      transits: currentTransits,
      insights: dailyInsights,
    });
  } catch (error) {
    console.error("Error fetching daily dashboard:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
});

export default router;
