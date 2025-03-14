import sweph from "sweph";
import { geocode } from "./geocoding";
import {
  Planet,
  PlanetPosition,
  NatalChart,
  Transits,
  AstrologicalEvent,
} from "../constants/types";
import moment from "moment-timezone";

sweph.set_ephe_path("./ephemeris_files");

const getZodiacSign = (longitude: number) => {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return signs[Math.floor(longitude / 30)];
};

const getJulianDate = (date: Date) => {
  const hour =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;
  return sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    hour,
    sweph.constants.SE_GREG_CAL
  );
};

const calculatePlanetPosition = (
  date: Date,
  planetId: number,
  planetName: string
) => {
  try {
    const jd = getJulianDate(date);

    const flags = sweph.constants.SEFLG_SWIEPH;
    const result = sweph.calc_ut(jd, planetId, flags);

    if (result.error) {
      throw new Error(
        `Error calculating position for ${planetName}: ${result.error}`
      );
    }

    return {
      name: planetName,
      longitude: result.data[0],
      latitude: result.data[1],
      distance: result.data[2],
      longitudeSpeed: result.data[3],
      zodiacSign: getZodiacSign(result.data[0]),
      jd, // Include Julian Date for other calculations
    };
  } catch (error) {
    console.error(`Error calculating position for ${planetName}:`, error);
    throw error;
  }
};

const calculatePlanetPositions = (date: Date) => {
  try {
    // Calculate positions for all planets
    const planetData = planets.map((planet) => {
      const position = calculatePlanetPosition(date, planet.id, planet.name);
      return {
        name: position.name,
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        zodiacSign: position.zodiacSign,
      };
    });

    return planetData;
  } catch (error) {
    console.error("Error calculating planet positions:", error);
    throw error;
  }
};

const getMoonPhaseName = (sunLongitude: number, moonLongitude: number) => {
  let elongation = (moonLongitude - sunLongitude) % 360;
  if (elongation < 0) elongation += 360;

  // Use elongation ranges to determine the phase
  // This is one common breakdown (8 primary phases):
  if (elongation < 22.5) return "New Moon";
  else if (elongation < 67.5) return "Waxing Crescent";
  else if (elongation < 112.5) return "First Quarter";
  else if (elongation < 157.5) return "Waxing Gibbous";
  else if (elongation < 202.5) return "Full Moon";
  else if (elongation < 247.5) return "Waning Gibbous";
  else if (elongation < 292.5) return "Last Quarter";
  else if (elongation < 337.5) return "Waning Crescent";
  else return "New Moon"; // wraps back around
};

const calculateMoonPhase = async (date: Date) => {
  const jd = sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60.0,
    sweph.constants.SE_GREG_CAL
  );

  try {
    // Use a synchronous approach
    const moonInfo = sweph.pheno_ut(
      jd,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );

    if (moonInfo.error) {
      throw new Error("Error calculating moon phase");
    }

    const phase = moonInfo.data[1] * 100; // Convert to percentage

    // Calculate Sun position
    const sunPos = sweph.calc_ut(
      jd,
      sweph.constants.SE_SUN,
      sweph.constants.SEFLG_SWIEPH
    );
    const moonPos = sweph.calc_ut(
      jd,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );

    if (sunPos.error || moonPos.error) {
      throw new Error("Error calculating Sun or Moon positions");
    }

    let phaseName = getMoonPhaseName(sunPos.data[0], moonPos.data[0]);

    return {
      percentage: phase,
      name: phaseName,
      illumination: moonInfo.data[0],
    };
  } catch (error) {
    console.error("Error calculating moon phase:", error);
    throw error;
  }
};

const calculateTransitAspects = (transitPlanets: any, natalPlanets: any) => {
  const aspects: any[] = [];
  const orbs = {
    conjunction: 8,
    opposition: 8,
    trine: 8,
    square: 7,
    sextile: 6,
  };

  transitPlanets.forEach((transitPlanet: PlanetPosition) => {
    natalPlanets.forEach((natalPlanet: PlanetPosition) => {
      const aspect = calculateAspect(
        transitPlanet.longitude,
        natalPlanet.longitude,
        orbs
      );

      if (aspect) {
        aspects.push({
          transitPlanet: transitPlanet.name,
          natalPlanet: natalPlanet.name,
          aspect: aspect.name,
          orb: aspect.orb,
        });
      }
    });
  });

  return aspects;
};

const calculateAspect = (long1: number, long2: number, orbs: any) => {
  const diff = Math.abs(long1 - long2);
  const aspects = [
    { name: "conjunction", angle: 0, orb: orbs.conjunction },
    { name: "opposition", angle: 180, orb: orbs.opposition },
    { name: "trine", angle: 120, orb: orbs.trine },
    { name: "square", angle: 90, orb: orbs.square },
    { name: "sextile", angle: 60, orb: orbs.sextile },
  ];

  for (const aspect of aspects) {
    const orb = Math.abs(diff - aspect.angle);
    if (orb <= aspect.orb) {
      return {
        name: aspect.name,
        orb: orb,
      };
    }
  }

  return null;
};

const calculateCurrentTransits = async (
  date: Date,
  natalChartData: NatalChart
) => {
  try {
    const transits = {
      planets: [],
      aspects: [],
      moonPhase: null,
    } as Transits;

    // Parse natal chart data if it's a string
    const natalChart =
      typeof natalChartData === "string"
        ? JSON.parse(natalChartData)
        : natalChartData;

    for (const planet of planets) {
      const position = await calculatePlanetPosition(
        date,
        planet.id,
        planet.name
      );
      transits.planets.push(position);
    }

    // Calculate Moon phase
    const moonPhase = await calculateMoonPhase(date);
    transits.moonPhase = moonPhase;

    // Calculate aspects between transit planets and natal chart
    transits.aspects = calculateTransitAspects(
      transits.planets,
      natalChart.planets
    );

    return transits;
  } catch (error) {
    console.error("Error calculating current transits:", error);
    throw error;
  }
};

const getSignificantAspects = (planetData: PlanetPosition[]) => {
  const aspects = [];
  const orbs = {
    conjunction: 8,
    opposition: 8,
    trine: 8,
    square: 7,
    sextile: 6,
  };

  for (let i = 0; i < planetData.length; i++) {
    for (let j = i + 1; j < planetData.length; j++) {
      const aspect = calculateAspect(
        planetData[i].longitude,
        planetData[j].longitude,
        orbs
      );
      if (aspect) {
        aspects.push(
          `${planetData[i].name} ${aspect.name} ${
            planetData[j].name
          } (orb: ${aspect.orb.toFixed(2)}°)`
        );
      }
    }
  }
  return aspects;
};

const getMoonPhase = (date: string) => {
  try {
    const jd = getJulianDate(new Date(date));
    const moonInfo = sweph.pheno_ut(
      jd,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );
    const phase = moonInfo.data[1] * 100;
    const moonAge = phase * 29.53;

    let phaseName;
    if (moonAge < 1.84566) phaseName = "New Moon";
    else if (moonAge < 5.53699) phaseName = "Waxing Crescent";
    else if (moonAge < 9.22831) phaseName = "First Quarter";
    else if (moonAge < 12.91963) phaseName = "Waxing Gibbous";
    else if (moonAge < 16.61096) phaseName = "Full Moon";
    else if (moonAge < 20.30228) phaseName = "Waning Gibbous";
    else if (moonAge < 23.99361) phaseName = "Last Quarter";
    else if (moonAge < 27.68493) phaseName = "Waning Crescent";
    else phaseName = "New Moon";

    return {
      phase: phase,
      phaseName: phaseName,
    };
  } catch (error) {
    console.error("Error calculating moon phase:", error);
    throw error;
  }
};

const getAstrologicalEvents = (planetData: PlanetPosition[], date: string) => {
  const events: AstrologicalEvent[] = [];
  const significantDegrees = [0, 30, 60, 90, 120, 150, 180];

  planetData.forEach((planet) => {
    const degreeInSign = planet.longitude % 30;
    significantDegrees.forEach((degree) => {
      if (Math.abs(degreeInSign - degree) < 1) {
        events.push({
          type: "planetary_position",
          planet: planet.name,
          description: `${planet.name} at ${degree}° of ${planet.zodiacSign}`,
          date: date,
          significance: `${planet.name} at a critical degree, indicating potential for significant developments`,
        });
      }
    });
  });

  return events;
};

// Calculate house cusps and angles
const calculateHouses = (jd: number, latitude: number, longitude: number) => {
  try {
    const houses = sweph.houses(
      jd,
      latitude,
      longitude,
      "P" // Placidus house system
    );

    if (!houses || !houses.data) {
      throw new Error("Failed to calculate houses");
    }

    console.log("Houses calculation:", houses);
    return {
      cusps: houses.data.houses,
      angles: {
        ascendant: houses.data.points[0],
        midheaven: houses.data.points[1],
        // Descendant is exactly opposite the Ascendant
        descendant: (houses.data.points[0] + 180) % 360,
        // IC is exactly opposite the Midheaven
        imumCoeli: (houses.data.points[1] + 180) % 360,
      },
    };
  } catch (error) {
    console.error("Error calculating houses:", error);
    throw error;
  }
};

// Calculate aspects between planets
const calculateAspects = (planets: PlanetPosition[]) => {
  const aspects: string[] = [];
  const orbs = {
    conjunction: 8, // 0°
    sextile: 6, // 60°
    square: 7, // 90°
    trine: 8, // 120°
    opposition: 8, // 180°
  };

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      // Calculate the shortest angular distance between the two planets
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;

      // Check each aspect type
      if (Math.abs(diff - 0) <= orbs.conjunction) {
        aspects.push(
          `${planet1.name} conjunction ${planet2.name} (orb: ${Math.abs(
            diff - 0
          ).toFixed(2)}°)`
        );
      }
      if (Math.abs(diff - 60) <= orbs.sextile) {
        aspects.push(
          `${planet1.name} sextile ${planet2.name} (orb: ${Math.abs(
            diff - 60
          ).toFixed(2)}°)`
        );
      }
      if (Math.abs(diff - 90) <= orbs.square) {
        aspects.push(
          `${planet1.name} square ${planet2.name} (orb: ${Math.abs(
            diff - 90
          ).toFixed(2)}°)`
        );
      }
      if (Math.abs(diff - 120) <= orbs.trine) {
        aspects.push(
          `${planet1.name} trine ${planet2.name} (orb: ${Math.abs(
            diff - 120
          ).toFixed(2)}°)`
        );
      }
      if (Math.abs(diff - 180) <= orbs.opposition) {
        aspects.push(
          `${planet1.name} opposition ${planet2.name} (orb: ${Math.abs(
            diff - 180
          ).toFixed(2)}°)`
        );
      }
    }
  }

  console.log("Calculated aspects:", aspects);
  return aspects;
};

const calculateBirthChart = async (
  dateTime: string,
  latitude: number,
  longitude: number,
  place: string,
  timezone: string
) => {
  try {
    // Parse the date and time using moment-timezone
    const birthMoment = moment.tz(dateTime, timezone);

    // Calculate Julian date
    const jd = sweph.julday(
      birthMoment.year(),
      birthMoment.month() + 1,
      birthMoment.date(),
      birthMoment.hour() + birthMoment.minute() / 60.0,
      sweph.constants.SE_GREG_CAL
    );

    // Calculate planet positions
    const planetPositions = planets.map((planet) => {
      const position = calculatePlanetPosition(
        birthMoment.toDate(),
        planet.id,
        planet.name
      );
      return {
        name: planet.name,
        longitude: position.longitude,
        latitude: position.latitude,
        distance: position.distance,
        zodiacSign: position.zodiacSign,
      };
    });

    // Calculate houses using the correct coordinates
    const houseData = calculateHouses(jd, latitude, longitude);

    // Calculate aspects
    const aspects = calculateAspects(planetPositions);

    return {
      timestamp: birthMoment.toISOString(),
      location: {
        latitude,
        longitude,
        place,
      },
      houses: houseData.cusps,
      ascendant: houseData.angles.ascendant,
      midheaven: houseData.angles.midheaven,
      descendant: houseData.angles.descendant,
      imumCoeli: houseData.angles.imumCoeli,
      planets: planetPositions,
      aspects,
    };
  } catch (error) {
    console.error("Error calculating birth chart:", error);
    throw error;
  }
};

// Define the planets array at the top level
const planets = [
  { name: "Sun", id: sweph.constants.SE_SUN },
  { name: "Moon", id: sweph.constants.SE_MOON },
  { name: "Mercury", id: sweph.constants.SE_MERCURY },
  { name: "Venus", id: sweph.constants.SE_VENUS },
  { name: "Mars", id: sweph.constants.SE_MARS },
  { name: "Jupiter", id: sweph.constants.SE_JUPITER },
  { name: "Saturn", id: sweph.constants.SE_SATURN },
  { name: "Uranus", id: sweph.constants.SE_URANUS },
  { name: "Neptune", id: sweph.constants.SE_NEPTUNE },
  { name: "Pluto", id: sweph.constants.SE_PLUTO },
];

export function calculateChartCompatibility(chart1: any, chart2: any) {
  // Extract planets from both charts
  const planets1 = chart1.planets;
  const planets2 = chart2.planets;

  // Overall compatibility score
  let overallScore = 0;

  // Calculate sun sign compatibility
  const sun1 = planets1.find((p: any) => p.name === "Sun");
  const sun2 = planets2.find((p: any) => p.name === "Sun");
  const sunCompatibility = calculateSignCompatibility(
    sun1.zodiacSign,
    sun2.zodiacSign
  );

  // Calculate moon sign compatibility
  const moon1 = planets1.find((p: any) => p.name === "Moon");
  const moon2 = planets2.find((p: any) => p.name === "Moon");
  const moonCompatibility = calculateSignCompatibility(
    moon1.zodiacSign,
    moon2.zodiacSign
  );

  // Calculate Venus compatibility (love)
  const venus1 = planets1.find((p: any) => p.name === "Venus");
  const venus2 = planets2.find((p: any) => p.name === "Venus");
  const venusCompatibility = calculateSignCompatibility(
    venus1.zodiacSign,
    venus2.zodiacSign
  );

  // Calculate Mars compatibility (passion)
  const mars1 = planets1.find((p: any) => p.name === "Mars");
  const mars2 = planets2.find((p: any) => p.name === "Mars");
  const marsCompatibility = calculateSignCompatibility(
    mars1.zodiacSign,
    mars2.zodiacSign
  );

  // Calculate Mercury compatibility (communication)
  const mercury1 = planets1.find((p: any) => p.name === "Mercury");
  const mercury2 = planets2.find((p: any) => p.name === "Mercury");
  const mercuryCompatibility = calculateSignCompatibility(
    mercury1.zodiacSign,
    mercury2.zodiacSign
  );

  // Calculate aspects between charts
  const aspectsCompatibility = calculateAspectsCompatibility(
    planets1,
    planets2
  );

  // Calculate final weighted score
  overallScore =
    sunCompatibility * 0.2 +
    moonCompatibility * 0.2 +
    venusCompatibility * 0.2 +
    marsCompatibility * 0.15 +
    mercuryCompatibility * 0.15 +
    aspectsCompatibility * 0.1;

  // Generate compatibility report
  return {
    overall: {
      score: Math.round(overallScore * 100) / 100,
      description: getCompatibilityDescription(overallScore),
    },
    areas: {
      identity: {
        score: sunCompatibility,
        description: `Sun sign compatibility: ${sun1.zodiacSign} and ${sun2.zodiacSign}`,
      },
      emotions: {
        score: moonCompatibility,
        description: `Moon sign compatibility: ${moon1.zodiacSign} and ${moon2.zodiacSign}`,
      },
      love: {
        score: venusCompatibility,
        description: `Love style compatibility: ${venus1.zodiacSign} and ${venus2.zodiacSign}`,
      },
      passion: {
        score: marsCompatibility,
        description: `Passion compatibility: ${mars1.zodiacSign} and ${mars2.zodiacSign}`,
      },
      communication: {
        score: mercuryCompatibility,
        description: `Communication compatibility: ${mercury1.zodiacSign} and ${mercury2.zodiacSign}`,
      },
    },
  };
}

// Helper function to calculate sign compatibility
function calculateSignCompatibility(sign1: string, sign2: string) {
  // Element compatibility
  const elements: { [key: string]: string } = {
    Aries: "Fire",
    Leo: "Fire",
    Sagittarius: "Fire",
    Taurus: "Earth",
    Virgo: "Earth",
    Capricorn: "Earth",
    Gemini: "Air",
    Libra: "Air",
    Aquarius: "Air",
    Cancer: "Water",
    Scorpio: "Water",
    Pisces: "Water",
  };

  const element1 = elements[sign1];
  const element2 = elements[sign2];

  // Element compatibility scores (0-1)
  if (element1 === element2) {
    return 0.9; // Same element = high compatibility
  } else if (
    (element1 === "Fire" && element2 === "Air") ||
    (element1 === "Air" && element2 === "Fire") ||
    (element1 === "Earth" && element2 === "Water") ||
    (element1 === "Water" && element2 === "Earth")
  ) {
    return 0.8; // Complementary elements
  } else if (
    (element1 === "Fire" && element2 === "Earth") ||
    (element1 === "Earth" && element2 === "Fire") ||
    (element1 === "Air" && element2 === "Water") ||
    (element1 === "Water" && element2 === "Air")
  ) {
    return 0.4; // Challenging elements
  } else {
    return 0.6; // Neutral
  }
}

// Helper function to calculate aspects compatibility
function calculateAspectsCompatibility(planets1: any[], planets2: any[]) {
  // Simplified for now - would typically analyze all planet positions and angles
  return 0.7; // Default moderate compatibility
}

// Helper function to get compatibility description
function getCompatibilityDescription(score: number) {
  if (score >= 0.8) {
    return "Exceptionally high compatibility! You have a natural understanding and flow together.";
  } else if (score >= 0.7) {
    return "Strong compatibility. You complement each other well with some exciting differences.";
  } else if (score >= 0.5) {
    return "Moderate compatibility. You'll experience both harmony and some challenges that help you grow.";
  } else if (score >= 0.3) {
    return "Some compatibility challenges. Your differences may create friction, but also opportunities for learning.";
  } else {
    return "This connection may feel challenging. You'll need to work on understanding each other's differences.";
  }
}

// Add these new functions to detect current astrological events
const getCurrentAstrologicalEvents = async (date = new Date()) => {
  try {
    const events = [];

    // Check for retrograde planets
    const retrogradeStatus = await getRetrogradeStatus(date);
    events.push(...retrogradeStatus);

    // Check for eclipses
    const eclipseInfo = await checkForEclipse(date);
    if (eclipseInfo) {
      events.push(eclipseInfo);
    }

    // Check for full/new moons
    const moonPhaseInfo = await calculateMoonPhase(date);
    if (
      moonPhaseInfo.name === "Full Moon" ||
      moonPhaseInfo.name === "New Moon"
    ) {
      events.push({
        type: "lunation",
        name: moonPhaseInfo.name,
        description: `${
          moonPhaseInfo.name
        } at ${moonPhaseInfo.percentage.toFixed(1)}% illumination`,
        date: date.toISOString(),
        significance:
          moonPhaseInfo.name === "Full Moon"
            ? "Full Moons bring culminations, revelations, and emotional peaks"
            : "New Moons represent fresh starts, new beginnings, and setting intentions",
      });
    }

    return events;
  } catch (error) {
    console.error("Error getting current astrological events:", error);
    throw error;
  }
};

// Check which planets are retrograde
const getRetrogradeStatus = async (date = new Date()) => {
  try {
    const retrogradeEvents = [];

    // We only check traditional planets that can go retrograde
    const retrogradeCheckPlanets = planets.filter((p) =>
      [
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
      ].includes(p.name)
    );

    for (const planet of retrogradeCheckPlanets) {
      const position = await calculatePlanetPosition(
        date,
        planet.id,
        planet.name
      );

      // Negative longitudeSpeed means retrograde motion
      if (position.longitudeSpeed < 0) {
        retrogradeEvents.push({
          type: "retrograde",
          planet: planet.name,
          description: `${planet.name} Retrograde in ${position.zodiacSign}`,
          date: date.toISOString(),
          significance: getRetrogradeSignificance(planet.name),
        });
      }
    }

    return retrogradeEvents;
  } catch (error) {
    console.error("Error checking retrograde status:", error);
    throw error;
  }
};

// Get significance of each planet's retrograde
const getRetrogradeSignificance = (planetName: string) => {
  const significances = {
    Mercury:
      "Communication issues, technology glitches, travel delays, and misunderstandings",
    Venus: "Reassessment of relationships, values, and financial matters",
    Mars: "Frustration, redirected energy, and review of actions and motivations",
    Jupiter: "Reassessment of beliefs, education, and expansion plans",
    Saturn: "Review of responsibilities, structures, and long-term goals",
    Uranus: "Internal revolution, unexpected changes to plans",
    Neptune: "Heightened intuition, confusion, and spiritual reassessment",
    Pluto: "Deep internal transformation and power dynamics review",
  };

  return (
    significances[planetName as keyof typeof significances] ||
    "Period of reflection and reassessment"
  );
};

// Check if there's an eclipse happening
const checkForEclipse = async (date = new Date()) => {
  try {
    const jd = getJulianDate(date);

    // Get positions of Sun and Moon
    const sunPos = sweph.calc_ut(
      jd,
      sweph.constants.SE_SUN,
      sweph.constants.SEFLG_SWIEPH
    );
    const moonPos = sweph.calc_ut(
      jd,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );

    if (sunPos.error || moonPos.error) {
      throw new Error("Error calculating Sun or Moon positions");
    }

    // Calculate angular distance between Sun and Moon
    let angularDistance = Math.abs(sunPos.data[0] - moonPos.data[0]);
    if (angularDistance > 180) angularDistance = 360 - angularDistance;

    // Check for lunar nodes position
    const nodePos = sweph.calc_ut(
      jd,
      sweph.constants.SE_TRUE_NODE,
      sweph.constants.SEFLG_SWIEPH
    );

    if (nodePos.error) {
      throw new Error("Error calculating lunar node position");
    }

    // Check if Sun and Moon are close to the nodes (within 12 degrees)
    const sunNodeDistance = Math.abs(sunPos.data[0] - nodePos.data[0]) % 180;
    const moonNodeDistance = Math.abs(moonPos.data[0] - nodePos.data[0]) % 180;

    // Simplified eclipse detection
    // For a more accurate implementation, you would need to use specialized eclipse calculations
    if (
      angularDistance < 3 &&
      (sunNodeDistance < 12 || Math.abs(sunNodeDistance - 180) < 12)
    ) {
      // Solar eclipse (New Moon near node)
      return {
        type: "eclipse",
        name: "Solar Eclipse",
        description: "Solar Eclipse - New beginnings with long-lasting impact",
        date: date.toISOString(),
        significance:
          "Solar eclipses represent powerful new beginnings, endings, and significant shifts in external circumstances",
      };
    } else if (
      Math.abs(angularDistance - 180) < 3 &&
      (moonNodeDistance < 12 || Math.abs(moonNodeDistance - 180) < 12)
    ) {
      // Lunar eclipse (Full Moon near node)
      return {
        type: "eclipse",
        name: "Lunar Eclipse",
        description: "Lunar Eclipse - Emotional culminations and revelations",
        date: date.toISOString(),
        significance:
          "Lunar eclipses bring emotional revelations, culminations, and significant shifts in internal awareness",
      };
    }

    return null;
  } catch (error) {
    console.error("Error checking for eclipse:", error);
    return null;
  }
};

// Function to get astrological events for a specific date
const getAstrologicalEventsForDate = async (targetDate: Date) => {
  try {
    // Get current events for the specified date
    const events = await getCurrentAstrologicalEvents(targetDate);

    // Get planetary positions for that date
    const planetPositions = await Promise.all(
      planets.map((planet) =>
        calculatePlanetPosition(targetDate, planet.id, planet.name)
      )
    );

    // Find significant planetary positions (planets at 0°, 29°, etc.)
    const significantPositions = planetPositions
      .filter((planet) => {
        const degreeInSign = planet.longitude % 30;
        return degreeInSign < 1 || degreeInSign > 29; // Beginning or end of sign
      })
      .map((planet) => ({
        type: "ingress",
        planet: planet.name,
        description: `${planet.name} ${
          planet.longitude % 30 < 1 ? "entering" : "leaving"
        } ${planet.zodiacSign}`,
        date: targetDate.toISOString(),
        significance: `Shift in ${getSignificanceByPlanet(planet.name)} energy`,
      }));

    // Add significant positions to events
    events.push(...significantPositions);

    return events;
  } catch (error) {
    console.error(
      `Error getting astrological events for ${targetDate}:`,
      error
    );
    throw error;
  }
};

// Get significance of each planet
const getSignificanceByPlanet = (planetName: string) => {
  const significances = {
    Sun: "identity, vitality, and purpose",
    Moon: "emotions, instincts, and habits",
    Mercury: "communication, thinking, and information processing",
    Venus: "relationships, values, and aesthetics",
    Mars: "action, desire, and assertiveness",
    Jupiter: "growth, expansion, and opportunity",
    Saturn: "structure, responsibility, and limitation",
    Uranus: "innovation, rebellion, and sudden change",
    Neptune: "spirituality, dreams, and dissolution",
    Pluto: "transformation, power, and regeneration",
  };

  return significances[planetName as keyof typeof significances] || "planetary";
};

// Function to get favorable dates for specific activities based on astrological factors
const getFavorableDatesForActivity = async (
  activity: string,
  startDate: Date,
  endDate: Date,
  limit: number = 3
) => {
  try {
    // Define a map of activities to favorable astrological conditions
    const activityConditions: {
      [key: string]: {
        favorablePlanets: string[];
        favorableSigns: string[];
        unfavorablePlanets: string[];
        avoidRetrograde: string[];
      };
    } = {
      dating: {
        favorablePlanets: ["Venus", "Jupiter"],
        favorableSigns: ["Libra", "Taurus", "Leo", "Sagittarius"],
        unfavorablePlanets: ["Saturn"],
        avoidRetrograde: ["Venus", "Mercury"],
      },
      "job hunting": {
        favorablePlanets: ["Jupiter", "Sun", "Mars"],
        favorableSigns: ["Capricorn", "Leo", "Aries", "Taurus"],
        unfavorablePlanets: [],
        avoidRetrograde: ["Mercury", "Jupiter"],
      },
      travel: {
        favorablePlanets: ["Jupiter", "Mercury"],
        favorableSigns: ["Sagittarius", "Gemini", "Aquarius"],
        unfavorablePlanets: ["Saturn"],
        avoidRetrograde: ["Mercury"],
      },
      "important conversation": {
        favorablePlanets: ["Mercury", "Jupiter"],
        favorableSigns: ["Gemini", "Libra", "Aquarius"],
        unfavorablePlanets: [],
        avoidRetrograde: ["Mercury"],
      },
      "financial decision": {
        favorablePlanets: ["Jupiter", "Venus"],
        favorableSigns: ["Taurus", "Capricorn", "Virgo"],
        unfavorablePlanets: ["Neptune"],
        avoidRetrograde: ["Mercury", "Venus"],
      },
    };

    // Default to general favorable conditions if activity not found
    const conditions = activityConditions[activity.toLowerCase()] || {
      favorablePlanets: ["Jupiter", "Venus"],
      favorableSigns: ["Libra", "Taurus", "Leo", "Sagittarius"],
      unfavorablePlanets: ["Saturn"],
      avoidRetrograde: ["Mercury"],
    };

    const favorableDates = [];
    const currentDate = new Date(startDate);
    const maxDays = Math.min(
      90,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Check each day in the range
    for (let i = 0; i < maxDays && favorableDates.length < limit; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() + i);

      // Get planetary positions for this date
      const planetPositions = await Promise.all(
        planets.map((planet) =>
          calculatePlanetPosition(checkDate, planet.id, planet.name)
        )
      );

      // Get retrograde planets
      const retrogradeStatus = await getRetrogradeStatus(checkDate);
      const retrogradeNames = retrogradeStatus.map((r) => r.planet);

      // Check if any avoid-retrograde planets are retrograde
      const hasUnfavorableRetrograde = conditions.avoidRetrograde.some(
        (planet) => retrogradeNames.includes(planet)
      );

      if (hasUnfavorableRetrograde) {
        continue; // Skip this date
      }

      // Calculate a score for this date
      let score = 0;

      // Check favorable planets in favorable signs
      for (const planet of planetPositions) {
        if (conditions.favorablePlanets.includes(planet.name)) {
          score += 1;
          if (conditions.favorableSigns.includes(planet.zodiacSign)) {
            score += 0.5;
          }
        }

        if (conditions.unfavorablePlanets.includes(planet.name)) {
          score -= 0.5;
        }
      }

      // Check moon phase (generally full moon is good for culmination, new moon for beginnings)
      const moonPhase = await calculateMoonPhase(checkDate);
      if (
        (activity.toLowerCase().includes("start") &&
          moonPhase.name === "New Moon") ||
        (activity.toLowerCase().includes("finish") &&
          moonPhase.name === "Full Moon")
      ) {
        score += 1;
      }

      // If score is positive, consider it favorable
      if (score > 0) {
        favorableDates.push({
          date: checkDate.toISOString(),
          score,
          moonPhase: moonPhase.name,
          favorablePlanets: planetPositions
            .filter((p) => conditions.favorablePlanets.includes(p.name))
            .map((p) => `${p.name} in ${p.zodiacSign}`),
        });
      }
    }

    // Sort by score (highest first)
    return favorableDates.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error(`Error finding favorable dates for ${activity}:`, error);
    throw error;
  }
};

// Function to parse date-related queries from natural language
const parseDateQuery = (
  query: string
): {
  targetDate: Date | null;
  dateRange: { start: Date; end: Date } | null;
  isDateQuery: boolean;
  activityQuery: string | null;
} => {
  const result = {
    targetDate: null as Date | null,
    dateRange: null as { start: Date; end: Date } | null,
    isDateQuery: false,
    activityQuery: null as string | null,
  };

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Check for specific date queries
  if (query.match(/\b(today|tonight)\b/i)) {
    result.targetDate = now;
    result.isDateQuery = true;
  } else if (query.match(/\b(tomorrow|next day)\b/i)) {
    result.targetDate = tomorrow;
    result.isDateQuery = true;
  } else if (query.match(/\bnext week\b/i)) {
    result.targetDate = nextWeek;
    result.isDateQuery = true;
  } else if (query.match(/\bnext month\b/i)) {
    result.targetDate = nextMonth;
    result.isDateQuery = true;
  }

  // Check for date range queries
  if (query.match(/\b(this|coming|next) (week|month)\b/i)) {
    const isWeek = query.match(/\bweek\b/i);
    const start = new Date(now);
    const end = new Date(now);

    if (isWeek) {
      end.setDate(end.getDate() + 7);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    result.dateRange = { start, end };
    result.isDateQuery = true;
  }

  // Check for activity queries
  const activityPatterns = [
    /when should I (start|begin) (.*?)(?:\?|$)/i,
    /when (is|would be) a good time to (.*?)(?:\?|$)/i,
    /best time for (.*?)(?:\?|$)/i,
    /favorable days? for (.*?)(?:\?|$)/i,
  ];

  for (const pattern of activityPatterns) {
    const match = query.match(pattern);
    if (match) {
      result.isDateQuery = true;
      result.activityQuery = match[match.length - 1].trim();

      // If no date range was specified, default to next 30 days
      if (!result.dateRange) {
        const start = new Date(now);
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        result.dateRange = { start, end };
      }

      break;
    }
  }

  return result;
};

export {
  planets,
  calculateCurrentTransits,
  calculatePlanetPosition,
  calculatePlanetPositions,
  calculateMoonPhase,
  calculateTransitAspects,
  getZodiacSign,
  getSignificantAspects,
  getMoonPhase,
  getAstrologicalEvents,
  calculateBirthChart,
  getCurrentAstrologicalEvents,
  getRetrogradeStatus,
  checkForEclipse,
  getAstrologicalEventsForDate,
  getFavorableDatesForActivity,
  parseDateQuery,
};
