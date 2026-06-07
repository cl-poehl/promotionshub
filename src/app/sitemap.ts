import type { MetadataRoute } from "next";
import { searchListings } from "@/lib/data";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://promotionshub.de";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await searchListings({});
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/finden`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/promotionen`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/bestenliste`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/erfahrung-teilen`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/promotionen/neu`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const listingEntries: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE_URL}/promotionen/${l.id}`,
    lastModified: l.posted_at ? new Date(l.posted_at) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...listingEntries];
}
