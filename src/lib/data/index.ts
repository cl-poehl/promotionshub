/**
 * Lese-Fassade für Listings/Gruppen/Universitäten.
 *
 * Bei vorhandenen Supabase-Env-Vars werden echte Queries ausgeführt,
 * sonst dient In-Memory-Mock als Fallback (für lokale Entwicklung
 * ohne Supabase-Projekt).
 *
 * Schreibpfade (Listing einreichen, Review abgeben, Beschwerde) gehen
 * ebenfalls hierdurch, scheitern aber im Mock-Modus laut, weil ohne
 * DB nichts persistiert werden kann.
 */

import {
  MIN_REVIEWS_FOR_GROUP_SCORE,
  MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE,
} from "@/lib/config";
import { flags } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockGroups, mockListings, mockUniversities } from "@/lib/data/mock";
import type {
  FundingType,
  Group,
  Listing,
  ThesisType,
  University,
} from "@/lib/supabase/types";

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const DATA_MODE: "supabase" | "mock" = supabaseConfigured() ? "supabase" : "mock";

export type ListingFilters = {
  universityId?: string;
  city?: string;
  specialty?: string;
  thesisType?: ThesisType;
  funding?: FundingType;
  search?: string;
};

export type ListingWithRelations = Listing & {
  group: Group | null;
  university: University | null;
};

export async function listUniversities(): Promise<University[]> {
  if (DATA_MODE === "mock") {
    return [...mockUniversities].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

/**
 * Liefert alle Filter-Optionen, die für die Suche relevant sind —
 * abgeleitet aus dem aktuellen Datenbestand. UI kann damit Filter
 * ausblenden, die nur eine Option hätten.
 */
export async function getFilterOptions(): Promise<{
  universities: University[];
  cities: string[];
  specialties: string[];
  fundings: FundingType[];
}> {
  if (DATA_MODE === "mock") {
    const cities = Array.from(new Set(mockUniversities.map((u) => u.city))).sort((a, b) => a.localeCompare(b, "de"));
    const specialties = Array.from(new Set(mockGroups.map((g) => g.specialty).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "de"));
    const fundings = Array.from(new Set(mockListings.filter((l) => l.status === "published").map((l) => l.funding))) as FundingType[];
    return { universities: mockUniversities, cities, specialties, fundings };
  }

  const supabase = await createSupabaseServerClient();

  // Wir laden die universities + die groups (nur die mit published listings)
  // + die distinct funding-Werte über einen Aggregat-Aufruf. Drei kleine Queries.
  const [{ data: unis }, { data: usedGroupsRaw }, { data: usedFundingsRaw }] = await Promise.all([
    supabase.from("universities").select("*").order("name"),
    supabase
      .from("groups")
      .select("id, specialty, university_id, universities!inner(city), listings!inner(id, status)")
      .eq("listings.status", "published"),
    supabase.from("listings").select("funding").eq("status", "published"),
  ]);

  const usedUniIds = new Set<string>();
  const cities = new Set<string>();
  const specialties = new Set<string>();
  for (const g of (usedGroupsRaw ?? []) as any[]) {
    if (g.specialty) specialties.add(g.specialty);
    if (g.university_id) usedUniIds.add(g.university_id);
    if (g.universities?.city) cities.add(g.universities.city);
  }

  const universities = (unis ?? []).filter((u) => usedUniIds.has(u.id));
  const fundings = Array.from(new Set((usedFundingsRaw ?? []).map((r: any) => r.funding))) as FundingType[];

  return {
    universities,
    cities: Array.from(cities).sort((a, b) => a.localeCompare(b, "de")),
    specialties: Array.from(specialties).sort((a, b) => a.localeCompare(b, "de")),
    fundings,
  };
}

export async function listGroups(): Promise<Group[]> {
  if (DATA_MODE === "mock") return mockGroups;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("groups").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getGroup(id: string): Promise<Group | null> {
  if (DATA_MODE === "mock") {
    return mockGroups.find((g) => g.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUniversity(id: string): Promise<University | null> {
  if (DATA_MODE === "mock") {
    return mockUniversities.find((u) => u.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("universities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function searchListings(filters: ListingFilters): Promise<ListingWithRelations[]> {
  if (DATA_MODE === "mock") {
    return applyMockFilters(filters);
  }

  const supabase = await createSupabaseServerClient();
  // Inner join, damit `eq` auf verschachtelte Spalten (Stadt, Universität) filtert.
  let query = supabase
    .from("listings")
    .select("*, group:groups!inner(*, university:universities!inner(*))")
    .eq("status", "published")
    .order("promoted", { ascending: false }) // promoted listings first IN SUCHE ONLY (§5)
    .order("posted_at", { ascending: false });

  // Array-Überlapp: matched, wenn das Listing den gewünschten Typ in seinem
  // thesis_types_offered-Array hat (z.B. AG bietet experimentell+klinisch).
  if (filters.thesisType) query = query.contains("thesis_types_offered", [filters.thesisType]);
  if (filters.funding) query = query.eq("funding", filters.funding);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.universityId) query = query.eq("group.university.id", filters.universityId);
  if (filters.city) query = query.eq("group.university.city", filters.city);
  if (filters.specialty) query = query.eq("group.specialty", filters.specialty);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    group: row.group ?? null,
    university: row.group?.university ?? null,
  })) as ListingWithRelations[];
}

export async function getListing(id: string): Promise<ListingWithRelations | null> {
  if (DATA_MODE === "mock") {
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return null;
    const group = mockGroups.find((g) => g.id === listing.group_id) ?? null;
    const university = group
      ? mockUniversities.find((u) => u.id === group.university_id) ?? null
      : null;
    return { ...listing, group, university };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, group:groups(*, university:universities(*))")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as any;
  return { ...row, group: row.group ?? null, university: row.group?.university ?? null };
}

export async function getStats(): Promise<{ listings: number; groups: number; universities: number }> {
  if (DATA_MODE === "mock") {
    return { listings: mockListings.length, groups: mockGroups.length, universities: mockUniversities.length };
  }
  const supabase = await createSupabaseServerClient();
  const [{ count: listings }, { count: groups }, { count: universities }] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("universities").select("*", { count: "exact", head: true }),
  ]);
  return {
    listings: listings ?? 0,
    groups: groups ?? 0,
    universities: universities ?? 0,
  };
}

export type GroupAggregate = {
  reviewCount: number;
  /** Anzahl der Berichte von erkannten Universitäts-Adressen. */
  verifiedStudentCount: number;
  averages: {
    supervision_quality: number | null;
    responsiveness: number | null;
    timeline_realism: number | null;
    project_delivered: number | null;
    would_recommend: number | null;
  };
};

const EMPTY_AGGREGATE: GroupAggregate = {
  reviewCount: 0,
  verifiedStudentCount: 0,
  averages: {
    supervision_quality: null,
    responsiveness: null,
    timeline_realism: null,
    project_delivered: null,
    would_recommend: null,
  },
};

/** Aggregat für ein konkretes Listing (= AG). */
export async function getListingAggregate(listingId: string): Promise<GroupAggregate> {
  if (DATA_MODE === "mock") return EMPTY_AGGREGATE;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_listing_aggregate", { p_listing_id: listingId });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return EMPTY_AGGREGATE;
  return mapAggregateRow(row);
}

export async function getGroupAggregate(groupId: string): Promise<GroupAggregate> {
  if (DATA_MODE === "mock") {
    // Phase 1: keine Reviews im Mock; immer leer.
    return EMPTY_AGGREGATE;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_group_aggregate", { p_group_id: groupId });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return EMPTY_AGGREGATE;
  return mapAggregateRow(row);
}

export type LeaderboardGroup = {
  groupId: string;
  name: string;
  specialty: string | null;
  reviewCount: number;
  verifiedStudentCount: number;
  overall: number;
};

export type LeaderboardListing = {
  listingId: string;
  title: string;
  groupName: string;
  isPersonNamed: boolean;
  reviewCount: number;
  verifiedStudentCount: number;
  overall: number;
};

/** Bestbewertete Kliniken/Institute (ab Schwellenwert). */
export async function getTopGroups(limit = 10): Promise<LeaderboardGroup[]> {
  if (DATA_MODE === "mock") return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_top_groups", {
    p_min_reviews: MIN_REVIEWS_FOR_GROUP_SCORE,
    p_limit: limit,
  });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    groupId: row.group_id,
    name: row.name,
    specialty: row.specialty ?? null,
    reviewCount: Number(row.review_count),
    verifiedStudentCount: Number(row.verified_student_count ?? 0),
    overall: Number(row.overall),
  }));
}

/** Bestbewertete AGs. Personen-benannte AGs nur in Phase 2 + erhöhte Schwelle. */
export async function getTopListings(limit = 10): Promise<LeaderboardListing[]> {
  if (DATA_MODE === "mock") return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_top_listings", {
    p_min_reviews: MIN_REVIEWS_FOR_GROUP_SCORE,
    p_limit: limit * 2, // Puffer, weil personen-benannte ggf. rausfallen
  });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? [])
    .map((row: any) => ({
      listingId: row.listing_id,
      title: row.title,
      groupName: row.group_name,
      isPersonNamed: Boolean(row.is_person_named),
      reviewCount: Number(row.review_count),
      verifiedStudentCount: Number(row.verified_student_count ?? 0),
      overall: Number(row.overall),
    }))
    .filter(
      (l: LeaderboardListing) =>
        !l.isPersonNamed ||
        (flags.NAMED_RATINGS_PUBLIC && l.reviewCount >= MIN_REVIEWS_FOR_PUBLIC_NAMED_SCORE),
    )
    .slice(0, limit);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAggregateRow(row: any): GroupAggregate {
  return {
    reviewCount: Number(row.review_count),
    verifiedStudentCount: Number(row.verified_student_count ?? 0),
    averages: {
      supervision_quality: row.avg_supervision_quality ?? null,
      responsiveness: row.avg_responsiveness ?? null,
      timeline_realism: row.avg_timeline_realism ?? null,
      project_delivered: row.avg_project_delivered ?? null,
      would_recommend: row.avg_would_recommend ?? null,
    },
  };
}

function applyMockFilters(filters: ListingFilters): ListingWithRelations[] {
  const search = filters.search?.trim().toLowerCase();
  return mockListings
    .filter((l) => l.status === "published")
    .map((l) => {
      const group = mockGroups.find((g) => g.id === l.group_id) ?? null;
      const university = group
        ? mockUniversities.find((u) => u.id === group.university_id) ?? null
        : null;
      return { ...l, group, university };
    })
    .filter((l) => {
      if (filters.universityId && l.university?.id !== filters.universityId) return false;
      if (filters.city && l.university?.city !== filters.city) return false;
      if (filters.thesisType && l.thesis_type !== filters.thesisType) return false;
      if (filters.funding && l.funding !== filters.funding) return false;
      if (search) {
        const hay = `${l.title} ${l.description} ${l.group?.name ?? ""}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // promoted zuerst (Phase 3 wirkt sich aus, sobald Flag aktiv)
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
    });
}
