const express = require("express");
const { authenticateUser } = require("../auth/supabase");
const { db } = require("../db");
const { birthInfo, birthChart } = require("../db/schema");
const { eq } = require("drizzle-orm");
const { calculateBirthChart } = require("../utils/astrology");

const router = express.Router();

// Get birth info for current user
router.get("/birth-info", authenticateUser, async (req, res) => {
  try {
    // First get the birth info
    const userBirthInfo = await db
      .select()
      .from(birthInfo)
      .where(eq(birthInfo.userId, req.user.id))
      .limit(1);

    if (!userBirthInfo || userBirthInfo.length === 0) {
      return res.status(404).json({ message: "Birth info not found" });
    }

    // Then get the associated chart data
    const userBirthChart = await db
      .select()
      .from(birthChart)
      .where(eq(birthChart.birthInfoId, userBirthInfo[0].id))
      .limit(1);

    res.json({
      birthInfo: userBirthInfo[0],
      birthChart: userBirthChart[0],
    });
  } catch (error) {
    console.error("Error fetching birth info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create or update birth info
router.post("/birth-info", authenticateUser, async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth } = req.body;

    // Validate input
    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Delete existing birth info if it exists
    await db.delete(birthInfo).where(eq(birthInfo.userId, req.user.id));

    // Insert new birth info
    const [newBirthInfo] = await db
      .insert(birthInfo)
      .values({
        userId: req.user.id,
        dateOfBirth: new Date(dateOfBirth),
        timeOfBirth,
        placeOfBirth,
      })
      .returning();

    // Calculate birth chart data
    const chartData = await calculateBirthChart(
      dateOfBirth,
      timeOfBirth,
      placeOfBirth
    );

    // Store chart data
    const [newBirthChart] = await db
      .insert(birthChart)
      .values({
        birthInfoId: newBirthInfo.id,
        chartData: JSON.stringify(chartData),
      })
      .returning();

    res.status(201).json({
      birthInfo: newBirthInfo,
      birthChart: newBirthChart,
    });
  } catch (error) {
    console.error("Error saving birth info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
