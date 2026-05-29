/**
 * Manuell gepflegte Supabase-Typen. Wenn die Supabase-CLI verfügbar ist,
 * kann diese Datei via `supabase gen types typescript --linked` ersetzt werden.
 */

export type ThesisType = "experimental" | "clinical" | "statistical" | "other";
export type FundingType = "paid" | "stipend" | "unpaid" | "unknown";
export type ListingSource = "scraped" | "submitted" | "claimed";
export type ListingStatus = "pending" | "published" | "archived" | "removed";

export type ReviewerEmailType = "university" | "personal";
export type StudentSignal = "verified_student" | "accountable_only";
export type VerificationTier = "email" | "documentary" | "founder_vouched";

export type ReviewStatus = "pending" | "published" | "under_review" | "removed";
export type FreeTextStatus =
  | "none"
  | "pending_moderation"
  | "published"
  | "flagged_factual"
  | "rejected";

export type ComplaintType = "factual_dispute" | "insult" | "other";
export type ComplaintState =
  | "received"
  | "forwarded_to_reviewer"
  | "awaiting_substantiation"
  | "resolved_kept"
  | "resolved_removed";

export type TakedownState = "live" | "under_review" | "removed";

export interface University {
  id: string;
  name: string;
  city: string;
  state: string;
  created_at: string;
}

export interface Group {
  id: string;
  university_id: string;
  name: string;
  specialty: string | null;
  public_url: string | null;
  created_at: string;
}

export interface Supervisor {
  id: string;
  group_id: string;
  name: string;
  title: string | null;
  role: string | null;
  public_profile_url: string | null;
  listing_status: "active" | "inactive";
  takedown_state: TakedownState;
  created_at: string;
}

export interface Listing {
  id: string;
  group_id: string;
  supervisor_id: string | null;
  title: string;
  description: string;
  thesis_type: ThesisType;
  /** Alle Typen, die diese AG anbietet. Filter prüft Array-Überlapp. */
  thesis_types_offered: ThesisType[];
  funding: FundingType;
  expected_duration_months: number | null;
  posted_at: string;
  source: ListingSource;
  application_contact: string | null;
  promoted: boolean;
  promotion_expires_at: string | null;
  status: ListingStatus;
  /**
   * AGs/Labs nach einer Einzelperson benannt → Bewertungen unterliegen
   * Personen-Rating-Schutz (höhere Schwelle + NAMED_RATINGS_PUBLIC-Flag).
   */
  is_person_named: boolean;
  created_at: string;
}

export interface ReviewerAccount {
  id: string;
  user_id: string;
  email: string;
  email_type: ReviewerEmailType;
  university_id: string | null;
  identity_verified: boolean;
  student_signal: StudentSignal;
  verification_tier: VerificationTier;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_account_id: string;
  group_id: string;
  /** Optional: AG/Listing, das spezifisch bewertet wird (null = ganze Klinik). */
  listing_id: string | null;
  supervisor_id: string | null;
  thesis_type: ThesisType;
  year_started: number;
  year_ended: number | null;
  supervision_quality: number;
  responsiveness: number;
  timeline_realism: number;
  project_delivered: number;
  would_recommend: number;
  free_text: string | null;
  free_text_status: FreeTextStatus;
  status: ReviewStatus;
  created_at: string;
}

export interface Complaint {
  id: string;
  target_review_id: string;
  complainant_contact: string;
  claim_text: string;
  type: ComplaintType;
  state: ComplaintState;
  received_at: string;
  forwarded_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface MonetizationSurface {
  id: string;
  kind: "listing_promotion" | "recruiting_ad" | "lead_gen" | "student_premium";
  active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      universities: TableShape<University>;
      groups: TableShape<Group>;
      supervisors: TableShape<Supervisor>;
      listings: TableShape<Listing>;
      reviewer_accounts: TableShape<ReviewerAccount>;
      reviews: TableShape<Review>;
      complaints: TableShape<Complaint>;
      monetization_surfaces: TableShape<MonetizationSurface>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
