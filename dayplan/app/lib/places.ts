/**
 * CLIENT-SIDE Places helpers.
 * Calls /api/places (our server proxy) — never touches the API key directly.
 *
 * enrichPlan() fetches real addresses for every stop in parallel,
 * then returns an updated plan. Stops that fail lookup keep their mock data.
 */

import { Plan, Stop } from "../types";

export interface PlaceResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

export async function lookupPlace(
  query: string,
  location: string
): Promise<PlaceResult | null> {
  try {
    const res = await fetch(
      `/api/places?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
    );
    if (res.status === 503) return null; // no API key — silent fallback
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Enriches all stops in a plan with real Places data. Runs lookups in parallel. */
export async function enrichPlan(plan: Plan, startLocation: string): Promise<Plan> {
  const enrichedStops = await Promise.all(
    plan.stops.map(async (stop): Promise<Stop> => {
      const result = await lookupPlace(stop.name, startLocation);
      if (!result) return stop; // keep mock data on failure
      return {
        ...stop,
        name: result.name,
        address: result.address,
        lat: result.lat,
        lng: result.lng,
      };
    })
  );

  return { ...plan, stops: enrichedStops };
}
