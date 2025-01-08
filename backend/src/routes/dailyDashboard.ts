import express, { Request, Response } from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart } from "../db/schema";
import { eq } from "drizzle-orm";
import { calculateCurrentTransits } from "../utils/astrology";
import { generateDailyInsights } from "../utils/openai";

const router = express.Router();

// Get daily dashboard data for current user
router.get("/daily-dashboard", authenticateUser, async (req: any, res: any) => {
  console.log("Fetching daily dashboard data");
  try {
    // First get the user's birth info and chart
    const userBirthInfo = await db
      .select()
      .from(birthInfo)
      .where(eq(birthInfo.userId, req.user.id))
      .limit(1);

    if (!userBirthInfo || userBirthInfo.length === 0) {
      return res.status(404).json({ message: "Birth info not found" });
    }

    const userBirthChart = await db
      .select()
      .from(birthChart)
      .where(eq(birthChart.birthInfoId, userBirthInfo[0].id))
      .limit(1);

    // Calculate current transits
    const currentTransits = await calculateCurrentTransits(
      new Date(),
      userBirthChart[0].chartData
    );

    // Generate personalized insights using OpenAI
    const dailyInsights = await generateDailyInsights(
      userBirthChart[0].chartData,
      currentTransits
    );

    res.json({
      transits: currentTransits,
      insights: dailyInsights,
    });
  } catch (error) {
    console.error("Error fetching daily dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
