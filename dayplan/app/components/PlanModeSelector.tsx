import { PlanMode } from "../types";

const MODES: { id: PlanMode; label: string; description: string; icon: string }[] = [
  {
    id: "relaxed",
    label: "Relaxed",
    description: "Fewer stops, plenty of breaks, done by 4 PM",
    icon: "☀️",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "All essential stops, sensible pace",
    icon: "⚖️",
  },
  {
    id: "fullday",
    label: "Full Day",
    description: "Everything on the list, maximise the day",
    icon: "🗓",
  },
];

interface Props {
  value: PlanMode;
  onChange: (mode: PlanMode) => void;
}

export default function PlanModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={`
            flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all duration-150
            ${value === mode.id
              ? "border-indigo-500 bg-indigo-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-gray-300"
            }
          `}
        >
          <span className="text-xl mb-1">{mode.icon}</span>
          <span className={`text-sm font-semibold ${value === mode.id ? "text-indigo-700" : "text-gray-700"}`}>
            {mode.label}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5 leading-tight">{mode.description}</span>
        </button>
      ))}
    </div>
  );
}
