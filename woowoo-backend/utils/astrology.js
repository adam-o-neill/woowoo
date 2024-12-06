const sweph = require("sweph");

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

const calculateMoonPhase = async (date) => {
  const julday = sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60.0,
    sweph.constants.SE_GREG_CAL
  );

  try {
    // Use a synchronous approach
    const moonInfo = sweph.pheno_ut(
      julday,
      sweph.constants.SE_MOON,
      sweph.constants.SEFLG_SWIEPH
    );

    if (moonInfo.error) {
      throw new Error("Error calculating moon phase");
    }

    const phase = moonInfo.phase * 100; // Convert to percentage
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
};
