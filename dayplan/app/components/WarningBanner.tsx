import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  warnings: string[];
}

export default function WarningBanner({ warnings }: Props) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = warnings.filter((_, i) => !dismissed.includes(i));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning, i) =>
        dismissed.includes(i) ? null : (
          <div
            key={i}
            className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800"
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
            <span className="flex-1">{warning}</span>
            <button
              onClick={() => setDismissed((d) => [...d, i])}
              className="text-amber-400 hover:text-amber-600"
            >
              <X size={14} />
            </button>
          </div>
        )
      )}
    </div>
  );
}
