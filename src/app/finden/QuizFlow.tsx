"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Beaker,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  Pencil,
  RefreshCcw,
  Share2,
  Stethoscope,
  Target,
  Trophy,
} from "lucide-react";

import { INTEREST_CATEGORIES } from "@/lib/quiz/categories";
import { matchListings, type MatchResult, type QuizAnswers } from "@/lib/quiz/match";
import type { ListingWithRelations } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";

type StepKey = "method" | "time" | "interests" | "computing" | "career" | "publication";
const STEPS: StepKey[] = ["method", "time", "interests", "computing", "career", "publication"];

/** URL-Kodierung der Antworten — kurze Keys für teilbare Links. */
function answersToParams(a: QuizAnswers): URLSearchParams {
  const p = new URLSearchParams();
  p.set("m", a.methodPreference);
  p.set("t", a.timeAvailable);
  p.set("i", a.interests.join(","));
  p.set("c", a.computingSkills);
  p.set("ca", a.careerGoal);
  p.set("pu", a.publicationImportance);
  return p;
}

function paramsToAnswers(sp: URLSearchParams): Partial<QuizAnswers> {
  const get = (k: string) => sp.get(k) || undefined;
  return {
    methodPreference: get("m") as QuizAnswers["methodPreference"] | undefined,
    timeAvailable: get("t") as QuizAnswers["timeAvailable"] | undefined,
    interests: sp.get("i")?.split(",").filter(Boolean),
    computingSkills: get("c") as QuizAnswers["computingSkills"] | undefined,
    careerGoal: get("ca") as QuizAnswers["careerGoal"] | undefined,
    publicationImportance: get("pu") as QuizAnswers["publicationImportance"] | undefined,
  };
}

function isComplete(a: Partial<QuizAnswers>): a is QuizAnswers {
  return !!(
    a.methodPreference &&
    a.timeAvailable &&
    a.interests &&
    a.interests.length > 0 &&
    a.computingSkills &&
    a.careerGoal &&
    a.publicationImportance
  );
}

export function QuizFlow({ listings }: { listings: ListingWithRelations[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  // Initial state aus URL ableiten (falls geteilter Link)
  const initial = paramsToAnswers(sp);
  const startCompleted = isComplete(initial);

  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(startCompleted);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(initial);

  useEffect(() => {
    const fromUrl = paramsToAnswers(sp);
    if (isComplete(fromUrl)) {
      setAnswers(fromUrl);
      setDone(true);
    }
  }, [sp]);

  const current = STEPS[stepIdx];
  const totalSteps = STEPS.length;
  const isLast = stepIdx === totalSteps - 1;

  const canAdvance = useMemo(() => {
    switch (current) {
      case "method":
        return !!answers.methodPreference;
      case "time":
        return !!answers.timeAvailable;
      case "interests":
        return (answers.interests?.length ?? 0) >= 1;
      case "computing":
        return !!answers.computingSkills;
      case "career":
        return !!answers.careerGoal;
      case "publication":
        return !!answers.publicationImportance;
    }
  }, [current, answers]);

  function next() {
    if (!canAdvance) return;
    if (isLast) {
      if (isComplete(answers)) {
        // URL aktualisieren → Ergebnis ist teilbar
        const params = answersToParams(answers);
        router.replace(`/finden?${params.toString()}`, { scroll: false });
      }
      setDone(true);
    } else {
      setStepIdx(stepIdx + 1);
    }
  }
  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }
  function restart() {
    setAnswers({});
    setStepIdx(0);
    setDone(false);
    router.replace("/finden", { scroll: false });
  }
  function editAnswers() {
    setDone(false);
    setStepIdx(0);
  }

  if (done && isComplete(answers)) {
    return <Results answers={answers} listings={listings} onRestart={restart} onEdit={editAnswers} />;
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-stone-500">
          <span>Frage {stepIdx + 1} von {totalSteps}</span>
          <span>{Math.round((stepIdx / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {current === "method" && <MethodStep answers={answers} setAnswers={setAnswers} />}
        {current === "time" && <TimeStep answers={answers} setAnswers={setAnswers} />}
        {current === "interests" && <InterestStep answers={answers} setAnswers={setAnswers} />}
        {current === "computing" && <ComputingStep answers={answers} setAnswers={setAnswers} />}
        {current === "career" && <CareerStep answers={answers} setAnswers={setAnswers} />}
        {current === "publication" && <PublicationStep answers={answers} setAnswers={setAnswers} />}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 disabled:opacity-40"
        >
          {isLast ? "Ergebnis anzeigen" : "Weiter"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================ STEP COMPONENTS ============================ */

type StepProps = {
  answers: Partial<QuizAnswers>;
  setAnswers: (a: Partial<QuizAnswers>) => void;
};

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-stone-950">{title}</h2>
      {subtitle && <p className="mt-1.5 text-stone-600">{subtitle}</p>}
    </div>
  );
}

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition ${
        selected
          ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      {children}
    </button>
  );
}

function MethodStep({ answers, setAnswers }: StepProps) {
  const options = [
    { key: "experimental", icon: Beaker, title: "Wet Lab", desc: "Pipettieren, Mikroskop, Tiermodelle, Zellkultur" },
    { key: "clinical", icon: Stethoscope, title: "Klinik", desc: "Patient:innen sehen, Studien, klinische Daten" },
    { key: "statistical", icon: BrainCircuit, title: "Daten", desc: "Auswertungen, Register, am Rechner Strukturen finden" },
    { key: "mixed", icon: Target, title: "Von allem etwas", desc: "Misch-Setting, mehrere Methoden, breit aufgestellt" },
  ] as const;
  return (
    <div>
      <StepHeader icon={Beaker} title="Was reizt dich am meisten?" subtitle="Wo siehst du dich täglich am liebsten?" />
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <OptionCard key={o.key} selected={answers.methodPreference === o.key} onClick={() => setAnswers({ ...answers, methodPreference: o.key })}>
            <div className="flex items-start gap-3">
              <o.icon className="h-5 w-5 text-indigo-700 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-stone-950">{o.title}</div>
                <div className="mt-0.5 text-sm text-stone-600">{o.desc}</div>
              </div>
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function TimeStep({ answers, setAnswers }: StepProps) {
  const options = [
    { key: "fulltime", title: "Vollzeit-Block möglich", desc: "Mehrere Monate ohne andere Verpflichtungen — z.B. Freisemester" },
    { key: "parttime", title: "1-2 Tage pro Woche", desc: "Neben dem Studium, kontinuierlich übers Semester" },
    { key: "minimal", title: "Nur wenig", desc: "Abende und Wochenenden, kein Lab-Zugang außerhalb der Bürozeiten" },
  ] as const;
  return (
    <div>
      <StepHeader icon={Clock} title="Wie viel Zeit hast du wirklich?" subtitle="Sei ehrlich — das filtert grundsätzlich passende Methodik mit." />
      <div className="grid gap-3">
        {options.map((o) => (
          <OptionCard key={o.key} selected={answers.timeAvailable === o.key} onClick={() => setAnswers({ ...answers, timeAvailable: o.key })}>
            <div className="font-semibold text-stone-950">{o.title}</div>
            <div className="mt-0.5 text-sm text-stone-600">{o.desc}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function InterestStep({ answers, setAnswers }: StepProps) {
  const current = answers.interests ?? [];
  const toggle = (k: string) => {
    const next = current.includes(k) ? current.filter((x) => x !== k) : [...current, k];
    setAnswers({ ...answers, interests: next });
  };
  return (
    <div>
      <StepHeader icon={Heart} title="Was interessiert dich fachlich?" subtitle="Mehrfachauswahl — wähle alle, die dich reizen. Mind. eines." />
      <div className="grid gap-3 sm:grid-cols-2">
        {INTEREST_CATEGORIES.map((cat) => (
          <OptionCard key={cat.key} selected={current.includes(cat.key)} onClick={() => toggle(cat.key)}>
            <div className="flex items-start gap-3">
              <div className={`h-5 w-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${current.includes(cat.key) ? "border-indigo-600 bg-indigo-600" : "border-stone-300"}`}>
                {current.includes(cat.key) && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div>
                <div className="font-semibold text-stone-950">{cat.label}</div>
                <div className="mt-0.5 text-sm text-stone-600">{cat.description}</div>
              </div>
            </div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function ComputingStep({ answers, setAnswers }: StepProps) {
  const options = [
    { key: "none", title: "Lieber gar nicht", desc: "Mit Programmieren / ML / Bioinformatik will ich nichts zu tun haben" },
    { key: "learning", title: "Will ich lernen", desc: "Promotion als Gelegenheit, Methoden aufzubauen" },
    { key: "confident", title: "Kann ich schon", desc: "Bring's mit oder mache aktuell Data Science neben dem Studium" },
  ] as const;
  return (
    <div>
      <StepHeader icon={BrainCircuit} title="Wie ist dein Verhältnis zu Programmieren?" subtitle="Manche AGs setzen Bioinformatik / ML voraus oder lehren es aktiv." />
      <div className="grid gap-3">
        {options.map((o) => (
          <OptionCard key={o.key} selected={answers.computingSkills === o.key} onClick={() => setAnswers({ ...answers, computingSkills: o.key })}>
            <div className="font-semibold text-stone-950">{o.title}</div>
            <div className="mt-0.5 text-sm text-stone-600">{o.desc}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function CareerStep({ answers, setAnswers }: StepProps) {
  const options = [
    { key: "clinic", title: "Klinik", desc: "Nach der Promotion direkt klinisch arbeiten" },
    { key: "academic", title: "Akademische Karriere", desc: "Forschung weitermachen — Postdoc, Habilitation, Lehrstuhl" },
    { key: "industry", title: "Industrie / Beratung", desc: "Pharma, Med-Tech, Consulting, Start-up" },
    { key: "unsure", title: "Weiß ich noch nicht", desc: "Optionen offen halten, breite Erfahrung sammeln" },
  ] as const;
  return (
    <div>
      <StepHeader icon={GraduationCap} title="Was kommt nach der Promotion?" subtitle="Damit boosten wir z.B. strukturierte Programme für die akademische Linie." />
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <OptionCard key={o.key} selected={answers.careerGoal === o.key} onClick={() => setAnswers({ ...answers, careerGoal: o.key })}>
            <div className="font-semibold text-stone-950">{o.title}</div>
            <div className="mt-0.5 text-sm text-stone-600">{o.desc}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

function PublicationStep({ answers, setAnswers }: StepProps) {
  const options = [
    { key: "low", title: "Hauptsache fertig", desc: "Titel reicht — Publikation wäre nice, aber nicht entscheidend" },
    { key: "medium", title: "Wäre schön", desc: "Co-Autor:in würde mich freuen, aber kein Muss" },
    { key: "high", title: "Sehr wichtig", desc: "Erstautor:in-Publikation im Idealfall — Forschungslebenslauf bauen" },
  ] as const;
  return (
    <div>
      <StepHeader icon={Award} title="Wie wichtig ist dir eine Publikation?" subtitle="Manche AGs haben Erstautor:in als Standard, andere nicht." />
      <div className="grid gap-3">
        {options.map((o) => (
          <OptionCard key={o.key} selected={answers.publicationImportance === o.key} onClick={() => setAnswers({ ...answers, publicationImportance: o.key })}>
            <div className="font-semibold text-stone-950">{o.title}</div>
            <div className="mt-0.5 text-sm text-stone-600">{o.desc}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}

/* ============================ RESULTS ============================ */

function Results({
  answers,
  listings,
  onRestart,
  onEdit,
}: {
  answers: QuizAnswers;
  listings: ListingWithRelations[];
  onRestart: () => void;
  onEdit: () => void;
}) {
  const matches = useMemo(() => matchListings(listings, answers).slice(0, 8), [listings, answers]);
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mein PromotionsHub-Quiz-Ergebnis",
          text: "Diese Doktorarbeiten passen zu meinen Antworten:",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User-cancelled oder Clipboard nicht verfügbar
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-semibold text-stone-950">
          {matches.length > 0 ? `Deine Top ${matches.length} Treffer` : "Keine Treffer"}
        </h2>
        <p className="mt-2 text-stone-600">
          {matches.length > 0
            ? "Basierend auf deinen Antworten — sortiert nach Match-Score."
            : "Probier es mit weniger spezifischen Antworten oder schau direkt in die Liste."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Antworten anpassen
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-800/30 hover:bg-indigo-800"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Link kopiert!
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Ergebnis teilen
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Neu starten
          </button>
          <Link
            href="/promotionen"
            className="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 no-underline hover:no-underline"
          >
            Alle Stellen
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {matches.map((m) => (
          <MatchEntry key={m.listing.id} match={m} />
        ))}
      </div>
    </div>
  );
}

function MatchEntry({ match }: { match: MatchResult }) {
  return (
    <div className="relative">
      <span className="absolute -top-3 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white shadow ring-2 ring-white">
        {match.score}% Match
      </span>
      <ListingCard listing={match.listing} />
      {match.reasons.length > 0 && (
        <ul className="mt-2 ml-1 space-y-0.5 text-xs text-stone-600">
          {match.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
