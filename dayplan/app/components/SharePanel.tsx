"use client";

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Map,
  Calendar,
  CalendarDays,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { Plan } from "../types";
import {
  buildGoogleMapsUrl,
  buildMailtoLink,
  buildGoogleCalendarUrl,
  downloadIcs,
} from "../lib/export";

interface Props {
  plan: Plan;
}

export default function SharePanel({ plan }: Props) {
  const [open, setOpen] = useState(false);
  const [gcalOpen, setGcalOpen] = useState(false);

  const mapsUrl = buildGoogleMapsUrl(plan);
  const mailtoUrl = buildMailtoLink(plan);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Share2 size={16} className="text-indigo-500" />
          <span className="font-semibold text-gray-800">Share & Export</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-100 pt-3">

          {/* ── Google Maps ── */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Map size={18} className="text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">Open in Google Maps</p>
              <p className="text-xs text-gray-500">Full route with all {plan.stops.length} stops</p>
            </div>
            <ExternalLink size={13} className="text-gray-300 flex-shrink-0" />
          </a>

          {/* ── Email (Gmail + Apple Mail) ── */}
          <a
            href={mailtoUrl}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">Share via Email</p>
              <p className="text-xs text-gray-500">Opens Gmail, Apple Mail, or your default app</p>
            </div>
            <ExternalLink size={13} className="text-gray-300 flex-shrink-0" />
          </a>

          {/* ── Google Calendar (per stop) ── */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setGcalOpen(!gcalOpen)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-indigo-700" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-800">Add to Google Calendar</p>
                <p className="text-xs text-gray-500">{plan.stops.length} events, one per stop</p>
              </div>
              {gcalOpen ? (
                <ChevronUp size={14} className="text-gray-300 flex-shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-gray-300 flex-shrink-0" />
              )}
            </button>

            {gcalOpen && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {plan.stops.map((stop) => (
                  <a
                    key={stop.id}
                    href={buildGoogleCalendarUrl(stop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{stop.name}</p>
                      <p className="text-xs text-gray-400">
                        {stop.suggestedArrival} · ~{stop.estimatedMinutes} min
                      </p>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Apple Calendar / ICS ── */}
          <button
            onClick={() => downloadIcs(plan)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={18} className="text-gray-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-800">Download for Apple Calendar</p>
              <p className="text-xs text-gray-500">
                Saves ralli-day-plan.ics · works with any calendar app
              </p>
            </div>
          </button>

        </div>
      )}
    </div>
  );
}
