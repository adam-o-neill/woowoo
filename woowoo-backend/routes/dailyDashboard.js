const express = require("express");
const { authenticateUser } = require("../auth/supabase");
const { db } = require("../db");
const { birthInfo, birthChart } = require("../db/schema");
const { eq } = require("drizzle-orm");
const { calculateCurrentTransits } = require("../utils/astrology");
const { generateDailyInsights } = require("../utils/openai");

const router = express.Router();

// Get daily dashboard data for current user
router.get("/daily-dashboard", authenticateUser, async (req, res) => {
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

module.exports = router;
