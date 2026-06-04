import { Compass } from "lucide-react";

import { searchListings } from "@/lib/data";
import { QuizFlow } from "./QuizFlow";

export const metadata = {
  title: "Quiz: Welche Doktorarbeit passt zu mir?",
  description:
    "Beantworte sechs kurze Fragen und finde die passende Doktorarbeit für deinen Stil, deine Zeit und dein Karriere-Ziel.",
};

export default async function FindenPage() {
  const listings = await searchListings({});

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
          <Compass className="h-3.5 w-3.5" />
          Find your thesis
        </span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
          Welche Doktorarbeit passt zu dir?
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Sechs Fragen, eine Minute Zeit, danach eine sortierte Liste der
          Stellen, die zu deinem Stil, deiner Zeit und deinem Karriere-Ziel
          passen.{" "}
          <strong className="text-stone-900">Kein Login nötig:</strong> deine
          Antworten verlassen deinen Browser nicht.
        </p>
      </header>

      <QuizFlow listings={listings} />
    </div>
  );
}
