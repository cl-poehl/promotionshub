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
  let query = supabase
    .from("listings")
    .select("*, group:groups(*, university:universities(*))")
    .eq("status", "published")
    .order("promoted", { ascending: false }) // promoted listings first IN SUCHE ONLY (§5)
    .order("posted_at", { ascending: false });

  if (filters.thesisType) query = query.eq("thesis_type", filters.thesisType);
  if (filters.funding) query = query.eq("funding", filters.funding);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

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

export type GroupAggregate = {
  reviewCount: number;
  averages: {
    supervision_quality: number | null;
    responsiveness: number | null;
    timeline_realism: number | null;
    project_delivered: number | null;
    would_recommend: number | null;
  };
};

export async function getGroupAggregate(groupId: string): Promise<GroupAggregate> {
  if (DATA_MODE === "mock") {
    // Phase 1: keine Reviews im Mock; immer leer.
    return {
      reviewCount: 0,
      averages: {
        supervision_quality: null,
        responsiveness: null,
        timeline_realism: null,
        project_delivered: null,
        would_recommend: null,
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_group_aggregate", { p_group_id: groupId });
  if (error) throw error;
  const row = data?.[0];
  if (!row) {
    return {
      reviewCount: 0,
      averages: {
        supervision_quality: null,
        responsiveness: null,
        timeline_realism: null,
        project_delivered: null,
        would_recommend: null,
      },
    };
  }
  return {
    reviewCount: Number(row.review_count),
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
