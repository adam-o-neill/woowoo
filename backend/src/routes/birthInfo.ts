import express from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart } from "../db/schema";
import { eq } from "drizzle-orm";
import { calculateBirthChart } from "../utils/astrology";
import moment from "moment-timezone";
import { geocode } from "../utils/geocoding";

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

    // First, geocode the location to get coordinates and timezone
    const locationData = await geocode(placeOfBirth);
    const { latitude, longitude, timezone } = locationData;

    // Delete existing birth info if it exists
    await db.delete(birthInfo).where(eq(birthInfo.userId, req.user.id));

    const [hours, minutes] = timeOfBirth.split(":").map(Number);

    // Parse the birth date (assumes dateOfBirth is "YYYY-MM-DD")
    const [year, month, day] = dateOfBirth.split("-").map(Number);

    // Create a timestamp that represents the local time at birth
    const localBirthMoment = moment.tz(
      `${dateOfBirth} ${timeOfBirth}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    // Store both UTC and local information
    const [newBirthInfo] = await db
      .insert(birthInfo)
      .values({
        userId: req.user.id,
        dateOfBirth: localBirthMoment.toDate(), // Stores as UTC in database
        timeOfBirth,
        placeOfBirth,
        latitude,
        longitude,
        timezone,
        originalLocalTime: timeOfBirth,
        originalTimeZone: timezone,
      })
      .returning();

    // Calculate birth chart using the precise local time
    const chartData = await calculateBirthChart(
      localBirthMoment.format(),
      latitude,
      longitude,
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
