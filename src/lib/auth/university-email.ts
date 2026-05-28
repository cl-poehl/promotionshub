/**
 * Erkennung von Universitäts-Email-Adressen deutscher medizinischer Fakultäten.
 *
 * Verifizierte Uni-Mail → email_type=university, "verifizierte/r Studierende/r".
 * Andere Mails → email_type=personal (Alumni-Pfad), Identität bleibt verifiziert,
 * aber das Studierenden-Signal ist schwächer (§6 Verifizierung).
 *
 * Liste ist nicht vollständig — erweitern, sobald neue Fakultäten gesedet werden.
 */

const UNIVERSITY_EMAIL_PATTERNS: RegExp[] = [
  /@.*\buni-[a-z-]+\.de$/i,
  /@.*\.uni-[a-z-]+\.de$/i,
  /@.*\bcharite\.de$/i,
  /@.*\bmh-hannover\.de$/i,
  /@.*\bmedizinische-hochschule[a-z-]*\.de$/i,
  /@.*\btu-(muenchen|dresden|berlin)\.de$/i,
  /@.*\bukaachen\.de$/i,
  /@.*\bukbonn\.de$/i,
  /@.*\bukm\.de$/i,
  /@.*\bukk\.de$/i,
  /@.*\bmedizin\.uni-[a-z-]+\.de$/i,
  /@.*\bstud(ent)?\.uni-[a-z-]+\.de$/i,
];

export type EmailType = "university" | "personal";

export function classifyEmail(email: string): EmailType {
  const normalized = email.trim().toLowerCase();
  return UNIVERSITY_EMAIL_PATTERNS.some((re) => re.test(normalized))
    ? "university"
    : "personal";
}
