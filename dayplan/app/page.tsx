"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MapPin, Sparkles, Route, Clock, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { parseRawList } from "./lib/parser";
import { buildPlan } from "./lib/planner";
import { Category, Plan, ParsedItem, PlanMode } from "./types";
import CategoryChip from "./components/CategoryChip";
import PlanModeSelector from "./components/PlanModeSelector";
import ShoppingRecommendations from "./components/ShoppingRecommendations";
import StopCard from "./components/StopCard";
import WarningBanner from "./components/WarningBanner";
import ProgressBar from "./components/ProgressBar";

// ─── Sample data (the Tsawwassen list from the brief) ──────────────────────
const SAMPLE_INPUT =
  "Soil, mini meds, pillows, king bed, duvet, rake, mop, Beach Grove Cafe, Coquitlam Chinese restaurant, Oakridge Mall, Tsawwassen Mills";

const ALL_CATEGORIES: Category[] = ["bedding", "pharmacy", "garden", "household", "food", "leisure"];

export default function Home() {
  const [rawInput, setRawInput] = useState(SAMPLE_INPUT);
  const [mode, setMode] = useState<PlanMode>("balanced");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [generating, setGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Generate plan ──────────────────────────────────────────────────────────
  function handleGenerate() {
    setGenerating(true);
    // Slight delay for perceived "thinking" feel
    setTimeout(() => {
      const items = parseRawList(rawInput);
      const dayPlan = buildPlan(items, mode);
      setParsedItems(items);
      setPlan(dayPlan);
      setActiveCategories([]);
      setShowInput(false);
      setGenerating(false);
    }, 600);
  }

  // ── Re-run optimise (same items, rebuild order) ────────────────────────────
  function handleOptimise() {
    if (!plan) return;
    setGenerating(true);
    setTimeout(() => {
      const newPlan = buildPlan(parsedItems, mode);
      setPlan({ ...newPlan, stops: newPlan.stops.map((s, i) => ({ ...s, completed: plan.stops[i]?.completed ?? false })) });
      setGenerating(false);
    }, 400);
  }

  // ── Drag-and-drop reorder ──────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !plan) return;
    const oldIndex = plan.stops.findIndex((s) => s.id === active.id);
    const newIndex = plan.stops.findIndex((s) => s.id === over.id);
    setPlan({ ...plan, stops: arrayMove(plan.stops, oldIndex, newIndex) });
  }

  // ── Toggle stop complete ───────────────────────────────────────────────────
  function toggleComplete(id: string) {
    if (!plan) return;
    setPlan({
      ...plan,
      stops: plan.stops.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    });
  }

  // ── Update notes ──────────────────────────────────────────────────────────
  function updateNotes(id: string, notes: string) {
    if (!plan) return;
    setPlan({ ...plan, stops: plan.stops.map((s) => (s.id === id ? { ...s, notes } : s)) });
  }

  // ── Category filter ───────────────────────────────────────────────────────
  function toggleCategory(cat: Category) {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const visibleStops = plan
    ? activeCategories.length > 0
      ? plan.stops.filter((s) => activeCategories.includes(s.category))
      : plan.stops
    : [];

  // ── Mode change regenerates if plan exists ────────────────────────────────
  function handleModeChange(m: PlanMode) {
    setMode(m);
    if (plan) {
      setGenerating(true);
      setTimeout(() => {
        const newPlan = buildPlan(parsedItems, m);
        setPlan(newPlan);
        setGenerating(false);
      }, 400);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Route size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">Ralli</h1>
              <p className="text-[10px] text-gray-400 leading-none">Tsawwassen, BC</p>
            </div>
          </div>
          {plan && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-full px-3 py-1.5 font-medium">
              <Clock size={12} />
              ~{plan.totalEstimatedHours}h day
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-4 space-y-4">

        {/* ── Input Section ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => setShowInput(!showInput)}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              <span className="font-semibold text-gray-800 text-sm">Your Errand List</span>
            </div>
            {showInput ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {showInput && (
            <div className="px-4 pb-4 space-y-3">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste your list here: soil, meds, pillows, Oakridge Mall…"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-gray-50"
                rows={4}
              />
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={12} />
                <span>Starting from: <strong className="text-gray-600">Tsawwassen, BC</strong></span>
                {/* TODO: Add Google Places Autocomplete here for dynamic start location */}
              </div>
            </div>
          )}
        </div>

        {/* ── Plan Mode ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Plan Mode</p>
          <PlanModeSelector value={mode} onChange={handleModeChange} />
        </div>

        {/* ── Generate / Optimise buttons ─────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !rawInput.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-95"
          >
            {generating ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Sparkles size={16} />
            )}
            Generate Plan
          </button>

          {plan && (
            <button
              onClick={handleOptimise}
              disabled={generating}
              className="flex items-center gap-1.5 bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-2xl transition-all duration-150"
            >
              <RotateCcw size={15} />
              Optimise
            </button>
          )}
        </div>

        {/* ── Plan output ─────────────────────────────────────────────────── */}
        {plan && !generating && (
          <>
            {/* Warnings */}
            <WarningBanner warnings={plan.warnings} />

            {/* Progress */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
              <ProgressBar stops={plan.stops} />
            </div>

            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.filter((cat) => plan.stops.some((s) => s.category === cat)).map((cat) => (
                <CategoryChip
                  key={cat}
                  category={cat}
                  active={activeCategories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                />
              ))}
              {activeCategories.length > 0 && (
                <button
                  onClick={() => setActiveCategories([])}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-full border border-gray-200"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Route summary strip */}
            <div className="bg-indigo-600 text-white rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-200">Route Summary</p>
                <p className="font-bold text-lg">{plan.stops.length} stops · ~{plan.totalEstimatedHours}h</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-200">First stop</p>
                <p className="text-sm font-semibold">{plan.stops[0]?.suggestedArrival}</p>
              </div>
              {/* TODO: Add "Open in Maps" button linking to Google Maps directions URL */}
            </div>

            {/* Stop cards with drag-and-drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleStops.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {visibleStops.map((stop, idx) => (
                    <StopCard
                      key={stop.id}
                      stop={stop}
                      index={idx}
                      onToggleComplete={toggleComplete}
                      onNotesChange={updateNotes}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Shopping recommendations */}
            <ShoppingRecommendations items={parsedItems} />

            {/* Reset */}
            <button
              onClick={() => { setPlan(null); setShowInput(true); setParsedItems([]); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Start a new plan
            </button>
          </>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {!plan && !generating && (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <div className="text-5xl">📋</div>
            <p className="text-sm font-medium text-gray-500">Paste your list above and tap Generate Plan</p>
            <p className="text-xs">The sample list is pre-loaded — try it!</p>
          </div>
        )}
      </main>
    </div>
  );
}
