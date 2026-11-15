/**
 * Validation des liens et des blocs côté client — miroir exact de
 * `SavePageRequest` (backend) pour signaler les erreurs avant l'envoi.
 */
import type { Bloc } from "../types";

export const CLES_LIEN = ["lien", "url", "href", "image", "avatar"] as const;

export const SLUGS_RESERVES = [
  "auth",
  "admin",
  "api",
  "exercices",
  "exercice",
  "sujets",
  "sujet",
  "espace",
  "profile",
  "parametres",
  "notifications",
  "dashbord-admin",
  "dashboard-professeur",
  "ennoncer",
  "ennoncer-sujet",
  "p",
];

export const MAX_BLOCS = 60;
export const MAX_ELEMENTS = 50;
export const LONGUEUR_TEXTE_MAX = 10000;
const PROFONDEUR_MAX = 4;

/** Lien autorisé : http(s)://, chemin relatif `/…` (pas `//`), ancre `#…`, mailto:, tel:. */
// Règle partagée avec tout le site (et identique au serveur)
import { lienSur } from "../../../utils/liens";
export { lienSur };

export function estCleLien(cle: string): boolean {
  return CLES_LIEN.some((s) => cle === s || cle.endsWith(`_${s}`));
}

export type TypeLien = "interne" | "ancre" | "externe" | "contact" | "invalide";

export function typeLien(lien: string): TypeLien {
  const l = lien.trim();
  if (!lienSur(l)) return "invalide";
  if (l.startsWith("/")) return "interne";
  if (l.startsWith("#")) return "ancre";
  if (/^(mailto:|tel:)/i.test(l)) return "contact";
  return "externe";
}

function verifierValeur(valeur: unknown, profondeur: number, cle: string | null): string | null {
  if (profondeur > PROFONDEUR_MAX) return "Structure de bloc trop profonde.";

  if (Array.isArray(valeur) || (valeur !== null && typeof valeur === "object")) {
    const entrees = Array.isArray(valeur)
      ? valeur.map((v) => [null, v] as const)
      : Object.entries(valeur as Record<string, unknown>);
    if (entrees.length > MAX_ELEMENTS) return `Un bloc ne peut pas contenir plus de ${MAX_ELEMENTS} éléments.`;
    for (const [k, v] of entrees) {
      const erreur = verifierValeur(v, profondeur + 1, typeof k === "string" ? k : cle);
      if (erreur) return erreur;
    }
    return null;
  }

  if (typeof valeur === "string") {
    if ([...valeur].length > LONGUEUR_TEXTE_MAX) return "Un texte de bloc dépasse la longueur maximale autorisée.";
    if (cle !== null && estCleLien(cle) && valeur !== "" && !lienSur(valeur)) {
      return `Le lien « ${cle} » n'est pas autorisé (http(s), chemin relatif, mailto ou tel uniquement).`;
    }
    return null;
  }

  if (valeur === null || valeur === undefined || typeof valeur === "boolean" || typeof valeur === "number") {
    return null;
  }
  return "Valeur de bloc invalide.";
}

/**
 * Retourne les erreurs au format du serveur : `{ "blocs.3.props": ["…"] }`.
 * `max` / `sujet` permettent de réutiliser la validation (ex. articles du blog : 80 blocs).
 */
export function validerBlocs(blocs: Bloc[], max = MAX_BLOCS, sujet = "Une page"): Record<string, string[]> {
  const erreurs: Record<string, string[]> = {};
  if (blocs.length > max) {
    erreurs.blocs = [`${sujet} ne peut pas contenir plus de ${max} blocs.`];
  }
  blocs.forEach((b, i) => {
    const e = verifierValeur(b.props ?? {}, 0, null);
    if (e) erreurs[`blocs.${i}.props`] = [e];
  });
  return erreurs;
}

/** Slug identique à `Str::slug` de Laravel (approximation : translittération des accents). */
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/gi, "ae")
    .replace(/œ/gi, "oe")
    .replace(/@/g, "-at-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

export function erreurSlug(slug: string): string | null {
  if (!slug) return "L'adresse est obligatoire.";
  if (slug.length > 120) return "L'adresse ne doit pas dépasser 120 caractères.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "L'adresse ne peut contenir que des lettres minuscules, chiffres et tirets.";
  }
  if (SLUGS_RESERVES.includes(slug)) return "Cette adresse est réservée par l'application.";
  return null;
}
