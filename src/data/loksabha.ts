/**
 * Lok Sabha constituencies — Chhattisgarh.
 *
 * INTENTIONALLY INDEPENDENT from src/data/hierarchy.ts (District ->
 * Assembly -> Mandal). Earlier drafts tried to nest Lok Sabha as the top
 * level of that hierarchy, but the organizational-districts Excel sheet
 * has no Lok Sabha column, and BJYM's org districts (भिलाई distinct from
 * दुर्ग, रायपुर शहर/ग्रामीण split, etc.) don't map 1:1 onto these 11 seats
 * without a separately verified assembly-level mapping — so this file
 * only lists the constituencies themselves, with no link into the
 * District/Assembly/Mandal data. On the registration form this renders
 * as its own standalone dropdown, not a parent step that gates which
 * districts are selectable.
 *
 * The 11 seat names below are the standard, stable public list. If you
 * have an updated/corrected list (or want to attach a verified
 * district/assembly mapping later), just edit this file — nothing else
 * needs to change, since nothing else depends on this data's shape.
 */

export type LokSabha = { id: string; nameEn: string; nameHi: string };

export const LOKSABHA_CONSTITUENCIES: LokSabha[] = [
  { id: "ls1", nameEn: "Sarguja", nameHi: "सरगुजा" },
  { id: "ls2", nameEn: "Raigarh", nameHi: "रायगढ़" },
  { id: "ls3", nameEn: "Janjgir-Champa", nameHi: "जांजगीर-चांपा" },
  { id: "ls4", nameEn: "Korba", nameHi: "कोरबा" },
  { id: "ls5", nameEn: "Bilaspur", nameHi: "बिलासपुर" },
  { id: "ls6", nameEn: "Rajnandgaon", nameHi: "राजनांदगांव" },
  { id: "ls7", nameEn: "Durg", nameHi: "दुर्ग" },
  { id: "ls8", nameEn: "Raipur", nameHi: "रायपुर" },
  { id: "ls9", nameEn: "Mahasamund", nameHi: "महासमुंद" },
  { id: "ls10", nameEn: "Kanker", nameHi: "कांकेर" },
  { id: "ls11", nameEn: "Bastar", nameHi: "बस्तर" },
];

export function findLokSabhaLabel(id?: string | null) {
  const ls = LOKSABHA_CONSTITUENCIES.find((l) => l.id === id);
  return ls ? { en: ls.nameEn, hi: ls.nameHi } : null;
}
