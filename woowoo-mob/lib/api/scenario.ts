import { apiClient } from "./client";
import { Scenario } from "@/data/scenarios";

export const scenarioAPI = {
  activateScenario: async (
    accessToken: string,
    scenario: Scenario,
    birthInfoId: string
  ): Promise<string> => {
    const response = await apiClient.authenticatedFetch(
      "/api/scenarios/activate",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          scenario,
          userBirthInfoId: birthInfoId,
        }),
      }
    );
    return response.result;
  },
};
