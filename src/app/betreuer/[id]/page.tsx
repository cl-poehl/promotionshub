import { notFound } from "next/navigation";
import Link from "next/link";

import { AggregateRating } from "@/components/AggregateRating";
import { MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE } from "@/lib/config";
import { DATA_MODE } from "@/lib/data";
import { flags } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Phase-2-Gerüst.
 *
 * Diese Seite zeigt einen namentlichen Betreuer-Score NUR an, wenn:
 *   1. NAMED_RATINGS_PUBLIC === true (per Env-Flag),
 *   2. Der Schwellenwert von §4 erfüllt ist,
 *   3. takedown_state === 'live'.
 *
 * Sonst wird die Seite versteckt (404). Das ist der ⚖️ kritische
 * Sicherheitsblock vor öffentlichen namentlichen Ratings.
 */
export default async function SupervisorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!flags.NAMED_RATINGS_PUBLIC) notFound();
  if (DATA_MODE === "mock") notFound();

  const supabase = await createSupabaseServerClient();

  const { data: supervisor } = await supabase
    .from("supervisors")
    .select("*, group:groups(*, university:universities(*))")
    .eq("id", id)
    .eq("takedown_state", "live")
    .maybeSingle();
  if (!supervisor) notFound();

  const { data: agg } = await supabase.rpc("get_supervisor_aggregate", {
    p_supervisor_id: id,
  });
  const row = agg?.[0];
  const reviewCount = row ? Number(row.review_count) : 0;

  if (reviewCount < MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE) {
    // Auch wenn Flag aktiv ist: ohne Schwelle keine namentliche Ansicht.
    notFound();
  }

  const aggregate = {
    reviewCount,
    averages: {
      supervision_quality: row?.avg_supervision_quality ?? null,
      responsiveness: row?.avg_responsiveness ?? null,
      timeline_realism: row?.avg_timeline_realism ?? null,
      project_delivered: row?.avg_project_delivered ?? null,
      would_recommend: row?.avg_would_recommend ?? null,
    },
  };

  const group: any = (supervisor as any).group;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href={`/gruppen/${group?.id}`} className="text-sm">
        ← Zur Gruppen-Seite
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {supervisor.title ? `${supervisor.title} ` : ""}
          {supervisor.name}
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {group?.name}
          {group?.university?.name ? ` · ${group.university.name}` : ""}
        </p>
      </header>

      <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold">Erfahrungsberichte</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Diese Aggregat-Bewertung beruht auf {reviewCount} unabhängigen
          verifizierten Berichten. Inhalte sind Meinungsäußerungen der
          jeweiligen Verfasser:innen. Hier gemeldete Tatsachenbehauptungen
          werden geprüft (siehe <Link href="/meldung">Inhalt melden</Link>).
        </p>
        <div className="mt-4">
          <AggregateRating aggregate={aggregate} />
        </div>
      </section>
    </div>
  );
}
