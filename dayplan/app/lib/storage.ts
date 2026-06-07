/**
 * LOCAL PERSISTENCE — keeps the user's plan across page reloads via localStorage.
 *
 * TODO: For multi-device sync, replace with a backend (Supabase, Firebase, etc.)
 * keyed by user account.
 */

import { ParsedItem, Plan, PlanMode } from "../types";

const STORAGE_KEY = "ralli:plan-state:v1";

export interface PersistedState {
  rawInput: string;
  mode: PlanMode;
  plan: Plan | null;
  parsedItems: ParsedItem[];
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.) — ignore
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}
