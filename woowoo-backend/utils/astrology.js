const sweph = require("sweph");
const { geocode } = require("./geocoding");

sweph.set_ephe_path("./ephemeris_files");

const getZodiacSign = (longitude) => {
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

const getJulianDate = (date) => {
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

const calculatePlanetPosition = (date, planetId, planetName) => {
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

const calculatePlanetPositions = (date) => {
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

const getMoonPhaseName = (sunLongitude, moonLongitude) => {
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

const calculateMoonPhase = async (date) => {
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

    const phase = moonInfo.phase * 100; // Convert to percentage

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
      illumination: moonInfo.phaseAngle,
    };
  } catch (error) {
    console.error("Error calculating moon phase:", error);
    throw error;
  }
};

const calculateTransitAspects = (transitPlanets, natalPlanets) => {
  const aspects = [];
  const orbs = {
    conjunction: 8,
    opposition: 8,
    trine: 8,
    square: 7,
    sextile: 6,
  };

  transitPlanets.forEach((transitPlanet) => {
    natalPlanets.forEach((natalPlanet) => {
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

const calculateAspect = (long1, long2, orbs) => {
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

const calculateCurrentTransits = async (date, natalChartData) => {
  try {
    const transits = {
      planets: [],
      aspects: [],
      moonPhase: null,
    };

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
      transits.planets.push({
        name: planet,
        ...position,
      });
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

const getSignificantAspects = (planetData) => {
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

const getMoonPhase = (date) => {
  try {
    const jd = getJulianDate(new Date(date));
    const moonInfo = sweph.pheno_ut(
      jd,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );
    const phase = moonInfo.phase * 100;
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

const getAstrologicalEvents = (planetData, date) => {
  const events = [];
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
const calculateHouses = (jd, latitude, longitude) => {
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
const calculateAspects = (planets) => {
  const aspects = [];
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

const calculateBirthChart = async (dateOfBirth, timeOfBirth, placeOfBirth) => {
  try {
    const location = await geocode(placeOfBirth);

    // Parse the date and time
    const [hours, minutes] = timeOfBirth.split(":").map(Number);
    const birthDate = new Date(dateOfBirth);
    birthDate.setUTCHours(hours, minutes, 0, 0); // Use UTC time

    // Calculate Julian date
    const jd = sweph.julday(
      birthDate.getUTCFullYear(),
      birthDate.getUTCMonth() + 1,
      birthDate.getUTCDate(),
      birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60.0,
      sweph.constants.SE_GREG_CAL
    );

    // Calculate planet positions
    const planetPositions = planets.map((planet) => {
      const position = calculatePlanetPosition(
        birthDate,
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
    const houseData = calculateHouses(
      jd,
      location.latitude,
      location.longitude
    );

    // Calculate aspects
    const aspects = calculateAspects(planetPositions);

    return {
      timestamp: birthDate.toISOString(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        place: location.formattedAddress || placeOfBirth,
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

// Update the exports to include all required functions
module.exports = {
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
