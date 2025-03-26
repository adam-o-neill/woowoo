import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Try to get environment variables from different sources
const getEnvVariable = (key: string): string | null => {
  // Try process.env first
  if (process.env[key]) {
    return process.env[key] as string;
  }

  // Try Constants.expoConfig.extra
  try {
    const extra = Constants.expoConfig?.extra;
    if (extra && extra[key]) {
      return extra[key] as string;
    }
  } catch (e) {
    console.log(`Error accessing Constants.expoConfig.extra.${key}:`, e);
  }

  return null;
};

// Default values for development (NEVER use in production)
const FALLBACK_URL = "https://vliqgpkrwwzbabqvltbb.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXFncGtyd3d6YmFicXZsdGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjM2NTMsImV4cCI6MjA0ODc5OTY1M30.-sEgJJ57KOdRrO5LNOWslydoq171aXR_avoBvLr24nU";

// Get environment variables with fallbacks
const supabaseUrl = getEnvVariable("EXPO_PUBLIC_SUPABASE_URL") || FALLBACK_URL;
const supabaseAnonKey =
  getEnvVariable("EXPO_PUBLIC_SUPABASE_ANON_KEY") || FALLBACK_KEY;

console.log("Supabase URL:", supabaseUrl ? "Found" : "Not found");
console.log("Supabase Key:", supabaseAnonKey ? "Found" : "Not found");

if (
  !getEnvVariable("EXPO_PUBLIC_SUPABASE_URL") ||
  !getEnvVariable("EXPO_PUBLIC_SUPABASE_ANON_KEY")
) {
  console.warn("Supabase environment variables missing, using fallbacks!");
}

// Create a function to get the Supabase client
let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      throw new Error("Failed to initialize Supabase client");
    }
  }
  return supabaseInstance;
};

// For backward compatibility
export const supabase = getSupabase();
