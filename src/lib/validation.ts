import { z } from "zod";

/**
 * Permissiver UUID-Struktur-Check.
 *
 * Zod v4 .uuid() validiert strikt nach RFC 4122 (Version-Bit 1–8,
 * Variant-Bit 8/9/a/b). Unsere Seed- und Test-UUIDs wie
 * `a0000000-0000-0000-0000-000000000001` sind strukturell korrekt
 * (8-4-4-4-12 hex) und werden vom Postgres-`uuid`-Typ akzeptiert,
 * scheitern aber an Zods strikter Prüfung.
 *
 * Wir nutzen daher eine strukturelle Validierung. Die echte Typprüfung
 * leistet Postgres beim Insert.
 */
export const uuidish = (message = "Ungültige ID — bitte aus der Liste wählen.") =>
  z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, message);
