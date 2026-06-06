export type Category =
  | "bedding"
  | "pharmacy"
  | "garden"
  | "household"
  | "food"
  | "leisure";

export type PlanMode = "relaxed" | "balanced" | "fullday";

export interface ParsedItem {
  id: string;
  name: string;
  category: Category;
  storeRecommendation?: string;
  productNote?: string;
}

export interface StopItem {
  itemId: string;
  name: string;
  note?: string;
}

export interface Stop {
  id: string;
  name: string;
  category: Category;
  address: string; // placeholder until Places API is connected
  items: StopItem[];
  estimatedMinutes: number;
  suggestedArrival: string;
  notes: string;
  completed: boolean;
  lat?: number; // placeholder for Maps API
  lng?: number;
  warning?: string;
}

export interface DayPlan {
  mode: PlanMode;
  startLocation: string;
  totalEstimatedHours: number;
  stops: Stop[];
  warnings: string[];
  generatedAt: string;
}
