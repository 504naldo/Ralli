import { Stop } from "../types";

interface Props {
  stops: Stop[];
}

export default function ProgressBar({ stops }: Props) {
  const done = stops.filter((s) => s.completed).length;
  const total = stops.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{done} of {total} stops complete</span>
        <span className="font-medium text-indigo-600">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
