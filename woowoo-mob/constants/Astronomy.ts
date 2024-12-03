export type PlanetPosition = {
  sign: string;
  degree: number;
};

export type MoonData = PlanetPosition & {
  phase: number;
  phaseName: string;
};

export type AstronomyData = {
  moonPhase: number;
  planets: {
    sun: {
      sign: string;
    };
  };
  moon: {
    sign: string;
  };
  // ... other properties ...
};
