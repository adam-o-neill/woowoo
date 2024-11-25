// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import swisseph from "npm:swisseph";

const ZODIAC_SIGNS = [
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

const MOON_PHASES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
];

serve(async (req) => {
  try {
    const now = new Date();

    // Initialize ephemeris
    swisseph.swe_set_ephe_path(null);

    const julday = swisseph.swe_julday(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      now.getUTCDate(),
      now.getUTCHours() + now.getUTCMinutes() / 60,
      swisseph.SE_GREG_CAL
    );

    // Calculate positions
    const bodies = {
      sun: swisseph.swe_calc_ut(julday, swisseph.SE_SUN, swisseph.SEFLG_SPEED),
      moon: swisseph.swe_calc_ut(
        julday,
        swisseph.SE_MOON,
        swisseph.SEFLG_SPEED
      ),
      mercury: swisseph.swe_calc_ut(
        julday,
        swisseph.SE_MERCURY,
        swisseph.SEFLG_SPEED
      ),
      venus: swisseph.swe_calc_ut(
        julday,
        swisseph.SE_VENUS,
        swisseph.SEFLG_SPEED
      ),
      mars: swisseph.swe_calc_ut(
        julday,
        swisseph.SE_MARS,
        swisseph.SEFLG_SPEED
      ),
    };

    // Calculate moon phase
    let moonPhase = (bodies.moon.longitude - bodies.sun.longitude) / 360;
    moonPhase = moonPhase < 0 ? moonPhase + 1 : moonPhase;

    // Get moon phase name
    const moonPhaseIndex = Math.floor(moonPhase * 8);
    const moonPhaseName = MOON_PHASES[moonPhaseIndex];

    const astronomyData = {
      timestamp: now.toISOString(),
      moon: {
        phase: moonPhase,
        phaseName: moonPhaseName,
        sign: ZODIAC_SIGNS[Math.floor(bodies.moon.longitude / 30)],
        degree: bodies.moon.longitude % 30,
      },
      planets: {
        sun: {
          sign: ZODIAC_SIGNS[Math.floor(bodies.sun.longitude / 30)],
          degree: bodies.sun.longitude % 30,
        },
        mercury: {
          sign: ZODIAC_SIGNS[Math.floor(bodies.mercury.longitude / 30)],
          degree: bodies.mercury.longitude % 30,
        },
        venus: {
          sign: ZODIAC_SIGNS[Math.floor(bodies.venus.longitude / 30)],
          degree: bodies.venus.longitude % 30,
        },
        mars: {
          sign: ZODIAC_SIGNS[Math.floor(bodies.mars.longitude / 30)],
          degree: bodies.mars.longitude % 30,
        },
      },
    };

    return new Response(JSON.stringify(astronomyData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/astronomy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
