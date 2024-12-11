import { API_CONFIG } from "./config";

class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL || "";
    this.apiKey = API_CONFIG.apiKey || "";
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  }

  async authenticatedFetch(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ) {
    console.log("fetching", endpoint);
    console.log("options", options);
    return this.fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export const apiClient = new APIClient();
