import { Star } from "lucide-react";

import { REVIEW_DIMENSIONS } from "@/lib/config";
import type { GroupAggregate } from "@/lib/data";

export function AggregateRating({ aggregate }: { aggregate: GroupAggregate }) {
  const overall =
    Object.values(aggregate.averages).reduce<{ sum: number; n: number }>(
      (acc, v) => (v != null ? { sum: acc.sum + Number(v), n: acc.n + 1 } : acc),
      { sum: 0, n: 0 },
    );
  const overallValue = overall.n > 0 ? overall.sum / overall.n : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-display text-2xl font-semibold tabular-nums text-stone-950">
              {overallValue ? overallValue.toFixed(1) : "–"}
            </span>
            <span className="text-sm text-stone-500">/ 5</span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            Basis: {aggregate.reviewCount}{" "}
            {aggregate.reviewCount === 1 ? "Bewertung" : "Bewertungen"}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {REVIEW_DIMENSIONS.map((dim) => {
          const value = aggregate.averages[dim.key];
          const pct = value ? (Number(value) / 5) * 100 : 0;
          return (
            <li key={dim.key} className="text-sm">
              <div className="flex items-center justify-between text-stone-700">
                <span>{dim.label}</span>
                <span className="font-medium tabular-nums text-stone-950">
                  {value === null ? "–" : Number(value).toFixed(1)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
