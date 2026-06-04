import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { DATA_MODE } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PromotionsHub Dresden – Doktorarbeiten in der Medizin finden und bewerten",
    template: "%s · PromotionsHub Dresden",
  },
  description:
    "Offene Doktorarbeit-Stellen für Medizinstudierende in Dresden finden – und ehrliche Bewertungen der Betreuung lesen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

async function getSessionEmail(): Promise<string | null> {
  if (DATA_MODE === "mock") return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

async function Header() {
  const email = await getSessionEmail();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 no-underline hover:no-underline">
          <Logo />
          <span className="font-display font-semibold text-[17px] tracking-tight text-[var(--fg)]">
            PromotionsHub <span className="text-indigo-700">Dresden</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/finden" className="text-stone-700 hover:text-stone-950 no-underline hover:no-underline font-medium">
            Quiz
          </Link>
          <Link href="/promotionen" className="text-stone-700 hover:text-stone-950 no-underline hover:no-underline">
            Stellen
          </Link>
          <Link href="/erfahrung-teilen" className="text-stone-700 hover:text-stone-950 no-underline hover:no-underline">
            Erfahrung teilen
          </Link>
          <Link href="/promotionen/neu" className="text-stone-700 hover:text-stone-950 no-underline hover:no-underline">
            Stelle einreichen
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span
                className="hidden sm:inline max-w-[180px] truncate text-sm text-stone-600"
                title={email}
              >
                {email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 cursor-pointer"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/anmelden"
              className="inline-flex items-center rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-800/30 transition hover:bg-indigo-800 hover:shadow no-underline hover:no-underline"
            >
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-700 to-indigo-900 text-white shadow-sm ring-1 ring-indigo-900/20"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </span>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-display font-semibold text-[17px] tracking-tight">
              PromotionsHub <span className="text-indigo-700">Dresden</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-stone-600 max-w-xs">
            Die unabhängige Plattform für Medizinstudierende in Dresden auf der
            Suche nach einer Doktorarbeit — mit ehrlichen Bewertungen der
            Betreuung.
          </p>
        </div>

        <FooterColumn title="Plattform">
          <Link href="/promotionen">Stellen durchsuchen</Link>
          <Link href="/promotionen/neu">Stelle einreichen</Link>
          <Link href="/erfahrung-teilen">Erfahrung teilen</Link>
        </FooterColumn>

        <FooterColumn title="Vertrauen">
          <Link href="/meldung">Inhalt melden</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </FooterColumn>

        <FooterColumn title="Über">
          <Link href="/impressum">Impressum</Link>
        </FooterColumn>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} PromotionsHub Dresden</p>
          <p>Unabhängig. Bezahlung beeinflusst keine Bewertung.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm [&_a]:text-stone-700 [&_a]:no-underline hover:[&_a]:text-stone-950 hover:[&_a]:underline hover:[&_a]:underline-offset-4">
        {Array.isArray(children)
          ? children.map((c, i) => <li key={i}>{c}</li>)
          : <li>{children}</li>}
      </ul>
    </div>
  );
}
