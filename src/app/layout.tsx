import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PromotionsHub – Doktorarbeiten in der Medizin finden und bewerten",
    template: "%s · PromotionsHub",
  },
  description:
    "Offene Doktorarbeit-Stellen für Medizinstudierende in Deutschland finden – und ehrliche Bewertungen der Betreuung lesen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-[var(--foreground)] no-underline hover:no-underline">
          PromotionsHub
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/promotionen">Promotionsstellen</Link>
          <Link href="/erfahrung-teilen">Erfahrung teilen</Link>
          <Link href="/promotionen/neu">Stelle einreichen</Link>
          <Link
            href="/anmelden"
            className="rounded-md bg-sky-700 px-3 py-1.5 text-white no-underline hover:no-underline"
          >
            Anmelden
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-12">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[var(--muted)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p>© {new Date().getFullYear()} PromotionsHub</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
          <Link href="/meldung">Inhalt melden</Link>
        </nav>
      </div>
    </footer>
  );
}
