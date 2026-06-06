/**
 * INPUT PARSER — converts a raw comma/newline-separated list into ParsedItems.
 *
 * TODO: Replace keyword matching with an LLM or NLP API call for better
 *       entity recognition and disambiguation.
 */
import { Category, ParsedItem } from "../types";

const KEYWORD_MAP: Record<string, { category: Category; storeRecommendation?: string; productNote?: string }> = {
  // Bedding
  pillow: { category: "bedding", storeRecommendation: "Sleep Country" },
  pillows: { category: "bedding", storeRecommendation: "Sleep Country" },
  "king bed": { category: "bedding", storeRecommendation: "Sleep Country" },
  duvet: { category: "bedding", storeRecommendation: "Sleep Country" },
  mattress: { category: "bedding", storeRecommendation: "Sleep Country" },
  "bed frame": { category: "bedding", storeRecommendation: "Sleep Country" },

  // Pharmacy / meds
  meds: { category: "pharmacy", storeRecommendation: "Walmart Pharmacy" },
  medicine: { category: "pharmacy", storeRecommendation: "Walmart Pharmacy" },
  medication: { category: "pharmacy", storeRecommendation: "Walmart Pharmacy" },
  "mini meds": { category: "pharmacy", storeRecommendation: "Walmart Pharmacy" },
  prescription: { category: "pharmacy", storeRecommendation: "Shoppers Drug Mart" },

  // Garden
  soil: {
    category: "garden",
    storeRecommendation: "Canadian Tire or Home Depot",
    productNote: "Choose potting mix or garden soil depending on your use.",
  },
  rake: {
    category: "garden",
    storeRecommendation: "Canadian Tire or Home Depot",
    productNote: "For soil work, get a bow rake or level rake — not a leaf rake.",
  },
  fertilizer: { category: "garden", storeRecommendation: "Canadian Tire or Home Depot" },
  mulch: { category: "garden", storeRecommendation: "Canadian Tire or Home Depot" },
  seeds: { category: "garden", storeRecommendation: "Canadian Tire or Home Depot" },
  shovel: { category: "garden", storeRecommendation: "Canadian Tire or Home Depot" },
  hoe: { category: "garden", storeRecommendation: "Canadian Tire or Home Depot" },

  // Household / cleaning
  mop: {
    category: "household",
    storeRecommendation: "Walmart, Canadian Tire, or Home Depot",
    productNote: "For hard floors: flat mop is great for quick clean-ups; spin mop is better for deep cleans.",
  },
  broom: { category: "household", storeRecommendation: "Walmart or Canadian Tire" },
  vacuum: { category: "household", storeRecommendation: "Best Buy or Walmart" },
  cleaner: { category: "household", storeRecommendation: "Walmart" },
  bucket: { category: "household", storeRecommendation: "Walmart or Canadian Tire" },

  // Food / restaurants
  "beach grove cafe": { category: "food" },
  "coquitlam chinese restaurant": { category: "food" },
  restaurant: { category: "food" },
  cafe: { category: "food" },
  coffee: { category: "food" },
  lunch: { category: "food" },
  dinner: { category: "food" },
  breakfast: { category: "food" },

  // Leisure / malls
  "oakridge mall": { category: "leisure" },
  "tsawwassen mills": { category: "leisure" },
  mall: { category: "leisure" },
  shopping: { category: "leisure" },
};

function matchKeyword(raw: string): {
  category: Category;
  storeRecommendation?: string;
  productNote?: string;
} {
  const lower = raw.toLowerCase().trim();

  // Exact match first
  if (KEYWORD_MAP[lower]) return KEYWORD_MAP[lower];

  // Partial match
  for (const [key, meta] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return meta;
  }

  return { category: "household" };
}

export function parseRawList(raw: string): ParsedItem[] {
  const tokens = raw
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return tokens.map((token, idx) => {
    const { category, storeRecommendation, productNote } = matchKeyword(token);
    return {
      id: `item-${idx}`,
      name: token
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      category,
      storeRecommendation,
      productNote,
    };
  });
}
