"use client";
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { ParsedItem } from "../types";
import CategoryChip from "./CategoryChip";

interface Props {
  items: ParsedItem[];
}

export default function ShoppingRecommendations({ items }: Props) {
  const [open, setOpen] = useState(false);

  const itemsWithNotes = items.filter((i) => i.storeRecommendation || i.productNote);

  if (itemsWithNotes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-indigo-500" />
          <span className="font-semibold text-gray-800">Shopping Recommendations</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">
            {itemsWithNotes.length} tips
          </span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {itemsWithNotes.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-800">{item.name}</span>
                <CategoryChip category={item.category} />
              </div>
              {item.storeRecommendation && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Best at: </span>
                  {item.storeRecommendation}
                </p>
              )}
              {item.productNote && (
                <p className="text-xs text-indigo-600 mt-0.5 italic">💡 {item.productNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
