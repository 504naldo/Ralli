/**
 * ROUTE PLANNER — groups parsed items into stops and builds a timed day plan.
 *
 * TODO: Replace mock coordinates and store lookup with:
 *   - Google Places API for real store addresses + hours
 *   - Google Maps Directions API for actual travel times + route optimization
 *   - Google Maps Distance Matrix API for stop grouping by proximity
 */
import { Category, Plan, ParsedItem, PlanMode, Stop } from "../types";

// ─── Mock store database ────────────────────────────────────────────────────
// TODO: Replace with Places API search query: findPlaceFromText / nearbySearch

interface MockStore {
  name: string;
  address: string;
  lat: number;
  lng: number;
  opensAt: number; // 24h hour
  closesAt: number;
  avgVisitMinutes: number;
}

const MOCK_STORES: Record<string, MockStore> = {
  "Sleep Country": {
    name: "Sleep Country Canada",
    address: "1234 56th St, Delta, BC V4L 1A1",
    lat: 49.0093,
    lng: -123.0658,
    opensAt: 9,
    closesAt: 20,
    avgVisitMinutes: 45,
  },
  "Walmart Pharmacy": {
    name: "Walmart Supercenter",
    address: "5688 Inlet Centre Way, Port Moody, BC V3H 0C6",
    lat: 49.2844,
    lng: -122.8374,
    opensAt: 8,
    closesAt: 23,
    avgVisitMinutes: 30,
  },
  "Canadian Tire": {
    name: "Canadian Tire",
    address: "1 Tsawwassen Dr, Delta, BC V4M 4G4",
    lat: 49.0063,
    lng: -123.0774,
    opensAt: 8,
    closesAt: 21,
    avgVisitMinutes: 35,
  },
  "Home Depot": {
    name: "The Home Depot",
    address: "7885 120th St, Delta, BC V4C 6P6",
    lat: 49.1456,
    lng: -122.9024,
    opensAt: 7,
    closesAt: 21,
    avgVisitMinutes: 40,
  },
  Walmart: {
    name: "Walmart Supercenter",
    address: "5688 Inlet Centre Way, Port Moody, BC V3H 0C6",
    lat: 49.2844,
    lng: -122.8374,
    opensAt: 8,
    closesAt: 23,
    avgVisitMinutes: 30,
  },
  "Beach Grove Cafe": {
    name: "Beach Grove Cafe",
    address: "1293 Beach Grove Rd, Delta, BC V4L 2K5",
    lat: 49.0012,
    lng: -123.0528,
    opensAt: 8,
    closesAt: 15,
    avgVisitMinutes: 40,
  },
  "Coquitlam Chinese Restaurant": {
    name: "Coquitlam Chinese Restaurant",
    address: "2980 Glen Dr, Coquitlam, BC V3B 6C8",
    lat: 49.2836,
    lng: -122.7944,
    opensAt: 11,
    closesAt: 22,
    avgVisitMinutes: 60,
  },
  "Oakridge Mall": {
    name: "Oakridge Centre",
    address: "650 W 41st Ave, Vancouver, BC V5Z 2M9",
    lat: 49.2328,
    lng: -123.1145,
    opensAt: 10,
    closesAt: 21,
    avgVisitMinutes: 90,
  },
  "Tsawwassen Mills": {
    name: "Tsawwassen Mills",
    address: "5000 Canoe Pass Way, Tsawwassen, BC V4M 0B3",
    lat: 49.0089,
    lng: -123.0748,
    opensAt: 10,
    closesAt: 21,
    avgVisitMinutes: 120,
  },
};

// ─── Timing config per plan mode ────────────────────────────────────────────
const MODE_CONFIG: Record<PlanMode, { startHour: number; maxHours: number; bufferMin: number }> = {
  relaxed: { startHour: 10, maxHours: 6, bufferMin: 20 },
  balanced: { startHour: 9, maxHours: 9, bufferMin: 10 },
  fullday: { startHour: 8, maxHours: 12, bufferMin: 5 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(hour: number, minute: number): string {
  const h = Math.floor(hour + minute / 60);
  const m = minute % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
}

function resolveStore(item: ParsedItem): string {
  if (!item.storeRecommendation) return item.name;
  // Pick first recommended store if multiple options listed
  return item.storeRecommendation.split(" or ")[0].split(",")[0].trim();
}

function categoryLabel(cat: Category): string {
  const labels: Record<Category, string> = {
    bedding: "Bedding",
    pharmacy: "Pharmacy",
    garden: "Garden",
    household: "Household",
    food: "Food & Dining",
    leisure: "Leisure",
  };
  return labels[cat];
}

// ─── Main planner ─────────────────────────────────────────────────────────────

export function buildPlan(items: ParsedItem[], mode: PlanMode): Plan {
  const config = MODE_CONFIG[mode];
  const warnings: string[] = [];

  // Group items by their recommended store (or their own name for restaurants/leisure)
  const storeMap = new Map<string, ParsedItem[]>();
  for (const item of items) {
    const key = item.category === "food" || item.category === "leisure" ? item.name : resolveStore(item);
    if (!storeMap.has(key)) storeMap.set(key, []);
    storeMap.get(key)!.push(item);
  }

  // Build stop order: start nearby (Tsawwassen area), then expand outward
  // TODO: Replace with Google Maps route optimisation API
  const TSAWWASSEN_ORDER = [
    "Tsawwassen Mills",
    "Beach Grove Cafe",
    "Canadian Tire",
    "Sleep Country",
    "Walmart Pharmacy",
    "Walmart",
    "Home Depot",
    "Oakridge Mall",
    "Coquitlam Chinese Restaurant",
  ];

  const orderedKeys = [
    ...TSAWWASSEN_ORDER.filter((k) => storeMap.has(k)),
    ...[...storeMap.keys()].filter((k) => !TSAWWASSEN_ORDER.includes(k)),
  ];

  let currentHour = config.startHour;
  let currentMinute = 0;
  const stops: Stop[] = [];

  for (const [idx, key] of orderedKeys.entries()) {
    const storeItems = storeMap.get(key)!;
    const mock = MOCK_STORES[key];
    const category = storeItems[0].category;

    // Travel time mock: 15 min between stops, 20 if crossing regions
    // TODO: Replace with Maps Distance Matrix API
    const travelMin = idx === 0 ? 0 : key.includes("Coquitlam") || key.includes("Oakridge") ? 35 : 20;
    currentMinute += travelMin;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    // Push to next hour if store not open yet
    if (mock && currentHour < mock.opensAt) {
      currentHour = mock.opensAt;
      currentMinute = 0;
    }

    const arrivalTime = formatTime(currentHour, currentMinute);
    const visitMin = mock?.avgVisitMinutes ?? 30;

    // Check closing time
    let warning: string | undefined;
    if (mock) {
      const departureH = currentHour + Math.floor((currentMinute + visitMin) / 60);
      if (departureH > mock.closesAt) {
        warning = `${key} closes at ${mock.closesAt}:00 — plan may be tight.`;
        warnings.push(warning);
      }
    }

    stops.push({
      id: `stop-${idx}`,
      name: mock?.name ?? key,
      category,
      address: mock?.address ?? "Address pending — connect Places API",
      items: storeItems.map((item) => ({
        itemId: item.id,
        name: item.name,
        note: item.productNote,
      })),
      estimatedMinutes: visitMin + config.bufferMin,
      suggestedArrival: arrivalTime,
      notes: categoryLabel(category),
      completed: false,
      lat: mock?.lat,
      lng: mock?.lng,
      warning,
    });

    currentMinute += visitMin + config.bufferMin;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  const totalHours = currentHour - config.startHour + currentMinute / 60;

  if (totalHours > config.maxHours) {
    const suggestion =
      mode === "fullday"
        ? "consider removing a few stops to make the day more manageable."
        : mode === "balanced"
        ? "consider switching to Full Day mode or removing stops."
        : "consider switching to Balanced or Full Day mode, or removing stops.";
    warnings.push(
      `This plan runs approximately ${totalHours.toFixed(1)} hours — ${suggestion}`
    );
  }

  if (stops.some((s) => s.category === "food") && !stops.find((s) => s.category === "food" && s.suggestedArrival.includes("12") || s.suggestedArrival.includes("1:"))) {
    warnings.push("Your meal stop may land outside typical lunch hours. Consider reordering stops.");
  }

  return {
    mode,
    startLocation: "Tsawwassen, BC",
    totalEstimatedHours: parseFloat(totalHours.toFixed(1)),
    stops,
    warnings,
    generatedAt: new Date().toISOString(),
  };
}
