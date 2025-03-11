import express from "express";
import { authenticateUser } from "../auth/supabase";
import { db } from "../db";
import { birthInfo, birthChart, person, relationship } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { calculateBirthChart } from "../utils/astrology";
import { geocode } from "../utils/geocoding";
import moment from "moment-timezone";
import { calculateChartCompatibility } from "../utils/astrology";

const router = express.Router();

// Get all friends for current user
router.get("/connections", authenticateUser, async (req: any, res: any) => {
  try {
    // Find the person record for this user
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Get all relationships for this person
    const relationships = await db
      .select({
        relationship: relationship,
        relatedPerson: person,
      })
      .from(relationship)
      .innerJoin(person, eq(relationship.relatedPersonId, person.id))
      .where(eq(relationship.personId, userPerson[0].id));

    res.json({ connections: relationships });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific connection/friend
router.get("/connections/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log("fetching connection details", id);

    // Find the user's person record
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Get the relationship with the specified ID
    const relationshipData = await db
      .select()
      .from(relationship)
      .where(
        and(
          eq(relationship.id, id),
          eq(relationship.personId, userPerson[0].id)
        )
      )
      .limit(1);

    if (!relationshipData || relationshipData.length === 0) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Get the related person's details
    const relatedPerson = await db
      .select()
      .from(person)
      .where(eq(person.id, relationshipData[0].relatedPersonId))
      .limit(1);

    if (!relatedPerson || relatedPerson.length === 0) {
      return res.status(404).json({ message: "Related person not found" });
    }

    // Get birth info for this person
    const birthInfoData = await db
      .select()
      .from(birthInfo)
      .where(eq(birthInfo.id, relatedPerson[0].birthInfoId))
      .limit(1);

    console.log("birthInfoData", birthInfoData);

    // Get chart data if available
    const chartData =
      birthInfoData && birthInfoData.length > 0
        ? await db
            .select()
            .from(birthChart)
            .where(eq(birthChart.birthInfoId, birthInfoData[0].id))
            .limit(1)
        : [];

    res.json({
      connection: {
        relationship: relationshipData[0],
        person: relatedPerson[0],
        birthInfo:
          birthInfoData && birthInfoData.length > 0 ? birthInfoData[0] : null,
        chartData:
          chartData && chartData.length > 0
            ? JSON.parse(chartData[0].chartData)
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching connection:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get compatibility between user and a connection
router.get(
  "/connections/:id/compatibility",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;

      // Find the user's person record
      const userPerson = await db
        .select()
        .from(person)
        .where(eq(person.userId, req.user.id))
        .limit(1);

      if (
        !userPerson ||
        userPerson.length === 0 ||
        !userPerson[0].birthInfoId
      ) {
        return res.status(404).json({ message: "User birth info not found" });
      }

      // Get the relationship
      const relationshipData = await db
        .select()
        .from(relationship)
        .where(
          and(
            eq(relationship.id, id),
            eq(relationship.personId, userPerson[0].id)
          )
        )
        .limit(1);

      if (!relationshipData || relationshipData.length === 0) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Get the related person
      const relatedPerson = await db
        .select()
        .from(person)
        .where(eq(person.id, relationshipData[0].relatedPersonId))
        .limit(1);

      if (
        !relatedPerson ||
        relatedPerson.length === 0 ||
        !relatedPerson[0].birthInfoId
      ) {
        return res.status(404).json({ message: "Friend birth info not found" });
      }

      // Get both birth charts
      const userChart = await db
        .select()
        .from(birthChart)
        .where(eq(birthChart.birthInfoId, userPerson[0].birthInfoId))
        .limit(1);

      const friendChart = await db
        .select()
        .from(birthChart)
        .where(eq(birthChart.birthInfoId, relatedPerson[0].birthInfoId))
        .limit(1);

      if (!userChart.length || !friendChart.length) {
        return res.status(404).json({ message: "Birth chart data not found" });
      }

      // Calculate compatibility
      const userChartData = JSON.parse(userChart[0].chartData);
      const friendChartData = JSON.parse(friendChart[0].chartData);

      const compatibility = calculateChartCompatibility(
        userChartData,
        friendChartData
      );

      res.json({
        compatibility,
      });
    } catch (error) {
      console.error("Error calculating compatibility:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Add a new connection/friend
router.post("/connections", authenticateUser, async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      phone,
      relationType,
      notes,
      birthInfo: birthInfoData,
    } = req.body;

    // Find the person record for this user
    const userPerson = await db
      .select()
      .from(person)
      .where(eq(person.userId, req.user.id))
      .limit(1);

    if (!userPerson || userPerson.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Create a new person
    const newPerson = await db
      .insert(person)
      .values({
        name,
        email,
        phone,
        notes,
        createdById: req.user.id,
      })
      .returning();

    // Geocode the location
    const locationData = await geocode(birthInfoData.placeOfBirth);
    const { latitude, longitude, timezone } = locationData;

    // Parse local birth time
    const localBirthMoment = moment.tz(
      `${birthInfoData.dateOfBirth} ${birthInfoData.timeOfBirth}`,
      "YYYY-MM-DD HH:mm",
      timezone
    );

    // Create birth info for this person
    const newBirthInfo = await db
      .insert(birthInfo)
      .values({
        personId: newPerson[0].id,
        dateOfBirth: localBirthMoment.toDate(),
        timeOfBirth: birthInfoData.timeOfBirth,
        placeOfBirth: birthInfoData.placeOfBirth,
        latitude,
        longitude,
        timezone,
        originalLocalTime: birthInfoData.timeOfBirth,
        originalTimeZone: timezone,
        createdById: req.user.id,
      })
      .returning();

    // Calculate and store birth chart
    const chartData = await calculateBirthChart(
      localBirthMoment.format(),
      latitude,
      longitude,
      birthInfoData.placeOfBirth,
      timezone
    );

    await db.insert(birthChart).values({
      birthInfoId: newBirthInfo[0].id,
      chartData: JSON.stringify(chartData),
    });

    // Update the person with birth info ID
    await db
      .update(person)
      .set({ birthInfoId: newBirthInfo[0].id })
      .where(eq(person.id, newPerson[0].id));

    // Create the relationship
    const newRelationship = await db
      .insert(relationship)
      .values({
        personId: userPerson[0].id,
        relatedPersonId: newPerson[0].id,
        type: relationType || "friend",
        notes,
        createdById: req.user.id,
      })
      .returning();

    res.status(201).json({
      success: true,
      connection: {
        relationship: newRelationship[0],
        person: newPerson[0],
        birthInfo: newBirthInfo[0],
      },
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
