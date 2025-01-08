import express, { Request, Response } from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart } from "../db/schema";
import { eq } from "drizzle-orm";
import { calculateBirthChart } from "../utils/astrology";

const router = express.Router();

interface BirthInfoRequest {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

// Get birth info for current user
router.get("/birth-info", authenticateUser, async (req: any, res: any) => {
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
router.post("/birth-info", authenticateUser, async (req: any, res: any) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth } = req.body;

    // Validate input
    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Delete existing birth info if it exists
    await db.delete(birthInfo).where(eq(birthInfo.userId, req.user.id));

    const [hours, minutes] = timeOfBirth.split(":").map(Number);

    // Parse the birth date (assumes dateOfBirth is "YYYY-MM-DD")
    const [year, month, day] = dateOfBirth.split("-").map(Number);

    // Create a UTC date. This ensures no local timezone offset issues.
    const birthDateUTC = new Date(
      Date.UTC(year, month - 1, day, hours, minutes, 0)
    );

    // Store the birth date with the correct local time
    const [newBirthInfo] = await db
      .insert(birthInfo)
      .values({
        userId: req.user.id,
        dateOfBirth: birthDateUTC,
        timeOfBirth,
        placeOfBirth,
      })
      .returning();

    // Calculate birth chart data using the local time
    const chartData = await calculateBirthChart(
      birthDateUTC.toISOString(),
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

export default router;
