import { apiClient } from "./client";

export interface BirthInfo {
  id?: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

export interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  zodiacSign: string;
}

export interface ChartData {
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    place: string;
  };
  houses: number[];
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumCoeli: number;
  planets: Planet[];
  aspects: string[];
}

export const birthChartAPI = {
  getBirthInfo: async (accessToken: string) => {
    return apiClient.authenticatedFetch("/api/birth-info", accessToken);
  },

  submitBirthInfo: async (accessToken: string, birthInfo: BirthInfo) => {
    console.log("Submitting birth info", birthInfo);
    return apiClient.authenticatedFetch("/api/birth-info", accessToken, {
      method: "POST",
      body: JSON.stringify(birthInfo),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
