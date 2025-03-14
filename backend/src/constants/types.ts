type Planet = {
  name: string;
  id: number;
};

type PlanetPosition = {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  zodiacSign: string;
};

type NatalChart = {
  planets: Planet[];
};

type Transits = {
  planets: PlanetPosition[];
  aspects: any[];
  moonPhase: any;
};

// Completely redefine AstrologicalEvent to support all event types
type AstrologicalEvent = {
  description: string;
  date: string;
  significance?: string;
  type?: string;
  planet?: string;
  name?: string;
  activity?: string;
  dates?: any[];
};

export { Planet, PlanetPosition, NatalChart, Transits, AstrologicalEvent };
