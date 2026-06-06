/**
 * Server-side proxy for Google Places Text Search.
 * Keeps GOOGLE_PLACES_API_KEY off the client bundle.
 *
 * GET /api/places?query=Canadian+Tire&location=Tsawwassen+BC
 *
 * Returns { name, address, lat, lng, placeId }
 * or      { error: "no_api_key" }  when key is not configured (client falls back to mock)
 * or      { error: "not_found" }   when Places returns no results
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const location = searchParams.get("location") ?? "Tsawwassen, BC";

  if (!query) {
    return NextResponse.json({ error: "query param required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // No key configured — tell the client to keep using mock data
  if (!apiKey) {
    return NextResponse.json({ error: "no_api_key" }, { status: 503 });
  }

  // TODO: Upgrade to Places API (New) / searchText endpoint for richer data
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", `${query} near ${location}`);
  url.searchParams.set("key", apiKey);
  // Bias results toward the starting region
  url.searchParams.set("region", "ca");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // cache 1 hour
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    return NextResponse.json({ error: "not_found", status: data.status }, { status: 404 });
  }

  const place = data.results[0];
  return NextResponse.json({
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    placeId: place.place_id,
  });
}
