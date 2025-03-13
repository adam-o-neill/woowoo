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
    try {
      // Don't make the request if there's no token
      if (!accessToken) {
        console.log(
          "No access token available, skipping request to:",
          endpoint
        );
        return { error: "Authentication required" };
      }

      console.log(`Making request to: ${this.baseURL}${endpoint}`);

      const controller = new AbortController();
      // Increase timeout from 10 seconds to 30 seconds
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      console.log("options", options);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 401 errors specially
        if (response.status === 401) {
          // Could trigger a logout or token refresh here
          return { error: "Authentication failed", authError: true };
        }
        console.error(`API error: ${response.status} ${response.statusText}`);

        return { error: `API error: ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      console.error("API client error:", error);
      return { error: "Failed to connect to API" };
    }
  }
}

export const apiClient = new APIClient();
