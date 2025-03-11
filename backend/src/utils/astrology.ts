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
          planet: planet.name,
          description: `${planet.name} at ${degree}° of ${planet.zodiacSign}`,
          date: date,
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
};
