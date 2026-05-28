import { REVIEW_DIMENSIONS } from "@/lib/config";
import type { GroupAggregate } from "@/lib/data";

export function AggregateRating({ aggregate }: { aggregate: GroupAggregate }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">
        Basis: {aggregate.reviewCount}{" "}
        {aggregate.reviewCount === 1 ? "Bewertung" : "Bewertungen"}
      </p>
      <ul className="mt-3 space-y-2">
        {REVIEW_DIMENSIONS.map((dim) => {
          const value = aggregate.averages[dim.key];
          return (
            <li key={dim.key} className="text-sm">
              <div className="flex items-center justify-between">
                <span>{dim.label}</span>
                <span className="font-medium tabular-nums">
                  {value === null ? "–" : `${value.toFixed(1)} / 5`}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded bg-stone-100">
                <div
                  className="h-1.5 rounded bg-sky-700"
                  style={{ width: value ? `${(Number(value) / 5) * 100}%` : "0%" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
