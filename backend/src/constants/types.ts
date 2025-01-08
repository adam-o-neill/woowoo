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

type AstrologicalEvent = {
  planet: string;
  description: string;
  date: string;
};

export { Planet, PlanetPosition, NatalChart, Transits, AstrologicalEvent };
