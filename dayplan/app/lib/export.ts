/**
 * EXPORT HELPERS — all integrations live here.
 * No API keys required; everything uses deep links or file generation.
 *
 * Google Maps:       waypoint URL (up to 9 intermediate stops)
 * Gmail/Apple Mail:  mailto: link (opens default mail client)
 * Google Calendar:   event template URL per stop
 * Apple Calendar:    .ics file download (iCalendar spec RFC 5545)
 */

import { Plan, Stop } from "../types";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function parseArrivalTime(timeStr: string): { hour: number; minute: number } {
  // Parses "9:00 AM", "12:30 PM", etc.
  const [time, meridiem] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  const hour =
    meridiem === "PM" && h !== 12
      ? h + 12
      : meridiem === "AM" && h === 12
      ? 0
      : h;
  return { hour, minute: m };
}

function toDateWithTime(timeStr: string): Date {
  const { hour, minute } = parseArrivalTime(timeStr);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ─── Google Maps ──────────────────────────────────────────────────────────────

/**
 * Builds a Google Maps directions URL for the full route.
 * Uses the stop addresses (real if Places API is configured, mock otherwise).
 *
 * TODO: When a stop has lat/lng, prefer coords over address string for accuracy.
 */
export function buildGoogleMapsUrl(plan: Plan): string {
  const stops = plan.stops;
  if (stops.length === 0) return "https://maps.google.com";

  const origin = encodeURIComponent(plan.startLocation);
  const last = stops[stops.length - 1];
  const destination = encodeURIComponent(last.address);

  // Maps URL supports max 8 intermediate waypoints
  const waypoints = stops
    .slice(0, -1)
    .slice(0, 8)
    .map((s) => encodeURIComponent(s.address))
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  url += "&travelmode=driving";
  return url;
}

// ─── Email (Gmail + Apple Mail) ───────────────────────────────────────────────

function formatPlanAsText(plan: Plan): string {
  const modeLabel = { relaxed: "Relaxed", balanced: "Balanced", fullday: "Full Day" }[plan.mode];
  const lines: string[] = [
    `My Ralli Day Plan`,
    `Starting from: ${plan.startLocation}`,
    `Mode: ${modeLabel}  |  ~${plan.totalEstimatedHours}h total`,
    ``,
  ];

  plan.stops.forEach((stop, i) => {
    lines.push(`${i + 1}. ${stop.name}  —  Arrive ${stop.suggestedArrival}`);
    lines.push(`   📍 ${stop.address}`);
    if (stop.items.length > 0) {
      lines.push(`   Items: ${stop.items.map((item) => item.name).join(", ")}`);
    } else if (stop.purpose) {
      lines.push(`   Purpose: ${stop.purpose}`);
    }
    if (stop.notes && stop.notes !== stop.category) lines.push(`   Notes: ${stop.notes}`);
    lines.push("");
  });

  lines.push("Sent from Ralli");
  return lines.join("\n");
}

/** Opens the user's default mail app (Gmail on Android, Apple Mail on iOS/Mac, etc.) */
export function buildMailtoLink(plan: Plan): string {
  const subject = `My Ralli Day Plan — ${plan.startLocation}`;
  const body = formatPlanAsText(plan);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Plain-text description for an event: items list for shopping stops, purpose for visit-only stops. */
function stopDescription(stop: Stop, lineSeparator: string): string {
  if (stop.items.length > 0) {
    return stop.items
      .map((i) => `• ${i.name}${i.note ? ` — ${i.note}` : ""}`)
      .join(lineSeparator);
  }
  return stop.purpose ?? "";
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

function toGCalDatetime(d: Date): string {
  // YYYYMMDDTHHmmss (local time, no Z — GCal interprets as user's timezone)
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

/** Builds a Google Calendar "add event" URL for a single stop. */
export function buildGoogleCalendarUrl(stop: Stop): string {
  const start = toDateWithTime(stop.suggestedArrival);
  const end = new Date(start.getTime() + stop.estimatedMinutes * 60 * 1000);

  const details = stopDescription(stop, "\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: stop.name,
    dates: `${toGCalDatetime(start)}/${toGCalDatetime(end)}`,
    details,
    location: stop.address,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Apple Calendar / ICS (RFC 5545) ─────────────────────────────────────────

function toIcsDatetime(d: Date): string {
  // UTC format required: YYYYMMDDTHHmmssZ
  return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function buildIcsEvent(stop: Stop, uid: string): string {
  const start = toDateWithTime(stop.suggestedArrival);
  const end = new Date(start.getTime() + stop.estimatedMinutes * 60 * 1000);
  const description = stopDescription(stop, "\\n");

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsDatetime(new Date())}`,
    `DTSTART:${toIcsDatetime(start)}`,
    `DTEND:${toIcsDatetime(end)}`,
    `SUMMARY:${escapeIcs(stop.name)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(stop.address)}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function buildIcsContent(plan: Plan): string {
  const events = plan.stops.map((stop, i) =>
    buildIcsEvent(stop, `ralli-stop-${i}-${Date.now()}@ralli.app`)
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ralli//DayPlan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Triggers a .ics file download in the browser. */
export function downloadIcs(plan: Plan): void {
  const content = buildIcsContent(plan);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ralli-day-plan.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
