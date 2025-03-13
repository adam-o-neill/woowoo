import express from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart, person } from "../db/schema";
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
  console.log("Birth info route hit");
  try {
    // Find the person record for this user
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      console.log("User profile not found");
      return res.status(404).json({ message: "User profile not found" });
    }

    if (!userPerson[0].birthInfoId) {
      console.log("Birth info not found");
      return res.status(404).json({ message: "Birth info not found" });
    }

    // Get the birth info
    const birthInfoData = await db
      .select()
      .from(birthInfo)
      .where(eq(birthInfo.id, userPerson[0].birthInfoId))
      .limit(1);

    if (!birthInfoData || birthInfoData.length === 0) {
      console.log("Birth info not found");
      return res.status(404).json({ message: "Birth info not found" });
    }

    // Get the associated chart data
    const chartData = await db
      .select()
      .from(birthChart)
      .where(eq(birthChart.birthInfoId, birthInfoData[0].id))
      .limit(1);

    res.json({
      birthInfo: birthInfoData[0],
      birthChart: chartData[0] || null,
    });
  } catch (error) {
    console.error("Error fetching birth info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create or update birth info
router.post("/birth-info", authenticateUser, async (req: any, res: any) => {
  console.log("Birth info post route hit");
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth } = req.body;
    console.log("reqbody:", req.body);

    // Validate input
    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // First, check if a person record exists for this user
    let userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    // If no person record exists, create one
    if (!userPerson || userPerson.length === 0) {
      userPerson = await db
        .insert(person)
        .values({
          name: req.user.email || "User", // Use email or default name
          userId: req.user.id,
          createdById: req.user.id,
        })
        .returning();
    } else {
      userPerson = [userPerson[0]]; // Ensure it's in array format
    }

    // Geocode the location to get coordinates and timezone
    const locationData = await geocode(placeOfBirth);
    const { latitude, longitude, timezone } = locationData;

    // Create a timestamp that represents the local time at birth
    const localBirthMoment = moment.tz(
      `${dateOfBirth} ${timeOfBirth}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    // Delete existing birth info if it exists
    if (userPerson[0].birthInfoId) {
      await db
        .delete(birthInfo)
        .where(eq(birthInfo.id, userPerson[0].birthInfoId));
    }

    // Store birth information
    const [newBirthInfo] = await db
      .insert(birthInfo)
      .values({
        personId: userPerson[0].id,
        dateOfBirth: localBirthMoment.toDate(),
        timeOfBirth,
        placeOfBirth,
        latitude,
        longitude,
        timezone,
        originalLocalTime: timeOfBirth,
        originalTimeZone: timezone,
        createdById: req.user.id,
      })
      .returning();

    // Update the person record with the birth info ID
    await db
      .update(person)
      .set({ birthInfoId: newBirthInfo.id })
      .where(eq(person.id, userPerson[0].id));

    // Calculate birth chart using the precise local time
    const chartData = await calculateBirthChart(
      localBirthMoment.format(),
      latitude,
      longitude,
      placeOfBirth,
      timezone
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
