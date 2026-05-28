import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Building2,
  Clock,
  HeartPulse,
  MapPin,
  Microscope,
} from "lucide-react";

import type { ListingWithRelations } from "@/lib/data";
import { stripMarkdown } from "@/components/Markdown";
import { FUNDING_TYPES, THESIS_TYPES } from "@/lib/config";

function labelOf<T extends { key: string; label: string }>(list: readonly T[], key: string) {
  return list.find((x) => x.key === key)?.label ?? key;
}

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "heute";
  if (days < 2) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 31) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

const THESIS_META = {
  experimental: {
    icon: Microscope,
    label: "Experimentell",
    chip: "bg-violet-50 text-violet-800 ring-violet-200",
    accent: "bg-violet-500",
  },
  clinical: {
    icon: HeartPulse,
    label: "Klinisch",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
    accent: "bg-sky-500",
  },
  statistical: {
    icon: BarChart3,
    label: "Statistisch",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    accent: "bg-emerald-500",
  },
  other: {
    icon: Bookmark,
    label: "Sonstige",
    chip: "bg-stone-100 text-stone-700 ring-stone-200",
    accent: "bg-stone-400",
  },
} as const;

const FUNDING_TONE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  stipend: "bg-amber-50 text-amber-900 ring-amber-200",
  unpaid: "bg-stone-100 text-stone-700 ring-stone-200",
  unknown: "bg-stone-50 text-stone-500 ring-stone-200",
};

export function ListingCard({
  listing,
  compact = false,
}: {
  listing: ListingWithRelations;
  compact?: boolean;
}) {
  const meta = THESIS_META[listing.thesis_type as keyof typeof THESIS_META] ?? THESIS_META.other;
  const ThesisIcon = meta.icon;
  const preview = stripMarkdown(listing.description, compact ? 140 : 200);

  return (
    <Link
      href={`/promotionen/${listing.id}`}
      className="group relative block overflow-hidden rounded-xl border border-stone-200 bg-white card-hover no-underline hover:no-underline"
    >
      {/* Farbiger Akzent-Streifen links */}
      <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-1 ${meta.accent}`} />

      <div className="pl-6 pr-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${meta.chip}`}
              >
                <ThesisIcon className="h-3 w-3" />
                {meta.label}
              </span>
              {listing.promoted && (
                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 ring-1 ring-amber-200">
                  Hervorgehoben
                </span>
              )}
            </div>

            <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-stone-950 group-hover:text-indigo-700 transition-colors">
              {listing.title}
            </h3>

            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {listing.group?.name ?? "—"}
              </span>
              {listing.university?.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.university.city}
                </span>
              )}
            </p>
          </div>
          <ArrowUpRight className="hidden sm:block h-4 w-4 shrink-0 text-stone-300 group-hover:text-indigo-700 transition" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-stone-700">{preview}</p>

        <CardFooter
          funding={listing.funding}
          duration={listing.expected_duration_months}
          postedAt={listing.posted_at}
        />
      </div>
    </Link>
  );
}

function CardFooter({
  funding,
  duration,
  postedAt,
}: {
  funding: string;
  duration: number | null;
  postedAt: string;
}) {
  const ageDays = Math.floor((Date.now() - new Date(postedAt).getTime()) / 86_400_000);
  const showFunding = funding && funding !== "unknown";
  const showDate = ageDays >= 7;
  const hasContent = showFunding || duration || showDate;

  if (!hasContent) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      {showFunding && (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ring-1 ${FUNDING_TONE[funding]}`}
        >
          {labelOf(FUNDING_TYPES, funding)}
        </span>
      )}
      {duration && (
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-700 ring-1 ring-stone-200">
          <Clock className="h-3 w-3" />
          {duration} Monate
        </span>
      )}
      {showDate && (
        <span className="ml-auto text-stone-500">{formatRelativeDate(postedAt)}</span>
      )}
    </div>
  );
}

