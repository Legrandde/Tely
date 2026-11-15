/**
 * Utilitaires du blog : couleurs de catégories, dates, auteurs, partage,
 * estimation du temps de lecture (miroir de `Article::estimerTempsLecture`).
 */
import type { Bloc } from "../pagebuilder/types";
import type { AuteurArticle, CouleurCategorie } from "../../types/blog";

// ─── Couleurs des catégories ──────────────────────────────────────────────

export interface StyleCouleur {
  libelle: string;
  /** Pastille au repos (fond clair). */
  chip: string;
  /** Pastille active / sélectionnée. */
  actif: string;
  /** Point de couleur. */
  point: string;
}

export const COULEURS_CATEGORIE: Record<CouleurCategorie, StyleCouleur> = {
  amber: { libelle: "Ambre", chip: "bg-amber-100 text-amber-800 hover:bg-amber-200", actif: "bg-amber-500 text-gray-900", point: "bg-amber-500" },
  emerald: { libelle: "Émeraude", chip: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100", actif: "bg-emerald-600 text-white", point: "bg-emerald-500" },
  sky: { libelle: "Ciel", chip: "bg-sky-50 text-sky-800 hover:bg-sky-100", actif: "bg-sky-600 text-white", point: "bg-sky-500" },
  violet: { libelle: "Violet", chip: "bg-violet-50 text-violet-800 hover:bg-violet-100", actif: "bg-violet-600 text-white", point: "bg-violet-500" },
  rose: { libelle: "Rose", chip: "bg-rose-50 text-rose-800 hover:bg-rose-100", actif: "bg-rose-600 text-white", point: "bg-rose-500" },
  gray: { libelle: "Gris", chip: "bg-gray-100 text-gray-700 hover:bg-gray-200", actif: "bg-gray-900 text-white", point: "bg-gray-500" },
};

export const LISTE_COULEURS = Object.keys(COULEURS_CATEGORIE) as CouleurCategorie[];

export function styleCouleur(couleur: string | null | undefined): StyleCouleur {
  return COULEURS_CATEGORIE[(couleur ?? "") as CouleurCategorie] ?? COULEURS_CATEGORIE.amber;
}

// ─── Dates ────────────────────────────────────────────────────────────────

const FORMAT_LONG = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const FORMAT_LONG_HEURE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const FORMAT_COURT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const RELATIF = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

function lireDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** « 15 novembre 2026 » */
export function dateLongue(iso: string | null | undefined): string {
  const d = lireDate(iso);
  return d ? FORMAT_LONG.format(d) : "";
}

/** « 15 novembre 2026 à 09:30 » */
export function dateHeureLongue(iso: string | null | undefined): string {
  const d = lireDate(iso);
  return d ? FORMAT_LONG_HEURE.format(d) : "";
}

/** « 15 nov. 2026 » */
export function dateCourte(iso: string | null | undefined): string {
  const d = lireDate(iso);
  return d ? FORMAT_COURT.format(d) : "—";
}

/** « aujourd'hui », « il y a 3 jours »… puis la date longue au-delà de 4 semaines. */
export function dateRelative(iso: string | null | undefined): string {
  const d = lireDate(iso);
  if (!d) return "";
  const jours = Math.round((d.getTime() - Date.now()) / 86_400_000);
  if (Math.abs(jours) > 28) return FORMAT_LONG.format(d);
  if (Math.abs(jours) >= 7) return RELATIF.format(Math.round(jours / 7), "week");
  return RELATIF.format(jours, "day");
}

/** ISO → valeur d'un `<input type="datetime-local">` (heure locale). */
export function isoVersLocal(iso: string | null | undefined): string {
  const d = lireDate(iso);
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Valeur `datetime-local` → ISO (UTC), ou null si invalide. */
export function localVersIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ─── Auteurs ──────────────────────────────────────────────────────────────

export function nomAuteur(a: AuteurArticle | null | undefined): string {
  if (!a) return "L'équipe Tely";
  return a.nom_complet?.trim() || `${a.prenom ?? ""} ${a.nom ?? ""}`.trim() || "L'équipe Tely";
}

export function initialesAuteur(a: AuteurArticle | null | undefined): string {
  if (!a) return "T";
  return `${a.prenom?.[0] ?? ""}${a.nom?.[0] ?? ""}`.toUpperCase() || "T";
}

// ─── Liens ────────────────────────────────────────────────────────────────

export const urlArticle = (slug: string) => `/blog/${encodeURIComponent(slug)}`;
export const urlCategorie = (slug: string) => `/blog/categorie/${encodeURIComponent(slug)}`;
export const urlTag = (tag: string) => `/blog?tag=${encodeURIComponent(tag)}`;

export interface LienPartage {
  id: "whatsapp" | "facebook" | "linkedin" | "x";
  libelle: string;
  href: string;
}

/** URLs de partage (toutes les valeurs sont encodées). */
export function liensPartage(url: string, titre: string): LienPartage[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titre);
  return [
    { id: "whatsapp", libelle: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${titre} ${url}`)}` },
    { id: "facebook", libelle: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "linkedin", libelle: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: "x", libelle: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ];
}

// ─── Temps de lecture ─────────────────────────────────────────────────────

/** Estimation côté client (200 mots/minute), identique au calcul du serveur. */
export function estimerTempsLecture(blocs: Bloc[]): number {
  let mots = 0;
  const parcourir = (v: unknown) => {
    if (typeof v === "string") {
      if (!/^(https?:\/\/|\/)/.test(v)) mots += v.split(/\s+/).filter((m) => /[\p{L}\p{N}]/u.test(m)).length;
    } else if (Array.isArray(v)) {
      v.forEach(parcourir);
    } else if (v && typeof v === "object") {
      Object.values(v).forEach(parcourir);
    }
  };
  blocs.forEach((b) => parcourir(b));
  return Math.max(1, Math.ceil(mots / 200));
}

/** « 4 min de lecture » */
export const libelleLecture = (minutes: number | null | undefined) => `${Math.max(1, minutes || 1)} min de lecture`;
