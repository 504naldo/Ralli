"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Stop } from "../types";
import CategoryChip from "./CategoryChip";

interface Props {
  stop: Stop;
  index: number;
  onToggleComplete: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export default function StopCard({ stop, index, onToggleComplete, onNotesChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative rounded-2xl border bg-white shadow-sm overflow-hidden
        transition-all duration-200
        ${stop.completed ? "opacity-60 border-gray-200" : "border-gray-200 hover:shadow-md"}
        ${isDragging ? "shadow-xl" : ""}
      `}
    >
      {/* Timeline dot + line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-indigo-400" />

      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Header row */}
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-300 hover:text-gray-500 touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <GripVertical size={18} />
          </button>

          {/* Stop number */}
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>

          {/* Name + chip */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-base leading-tight ${stop.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                {stop.name}
              </h3>
              <CategoryChip category={stop.category} />
            </div>

            {/* Address */}
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={11} />
              <span className="truncate">{stop.address}</span>
            </div>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Timing row */}
        <div className="flex items-center gap-4 mt-2 ml-8">
          <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <Clock size={12} />
            <span>Arrive {stop.suggestedArrival}</span>
          </div>
          <div className="text-xs text-gray-400">~{stop.estimatedMinutes} min</div>
        </div>

        {/* Warning */}
        {stop.warning && (
          <div className="ml-8 mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>{stop.warning}</span>
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="ml-8 mt-3 space-y-3">
            {/* Items list (shopping stops) or purpose (food / leisure stops) */}
            {stop.items.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Items to Buy</p>
                <ul className="space-y-1.5">
                  {stop.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-800">{item.name}</span>
                        {item.note && (
                          <p className="text-xs text-indigo-600 mt-0.5 italic">{item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : stop.purpose ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Purpose</p>
                <p className="text-sm text-gray-700">{stop.purpose}</p>
              </div>
            ) : null}

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <textarea
                value={stop.notes}
                onChange={(e) => onNotesChange(stop.id, e.target.value)}
                placeholder="Add your own notes…"
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Complete button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => onToggleComplete(stop.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all
              ${stop.completed
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }
            `}
          >
            {stop.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {stop.completed ? "Done" : "Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
