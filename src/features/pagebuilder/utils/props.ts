/**
 * Lecteurs défensifs : les props viennent de l'API (JSON libre), on ne leur fait pas confiance.
 */
import { lienSur } from "./liens";

/** Chaîne nettoyée ("" si absente ou non textuelle). */
export function txt(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return "";
}

/** Lien ou image utilisable, sinon "". */
export function lien(v: unknown): string {
  const s = txt(v);
  return s && lienSur(s) ? s : "";
}

/** Liste d'objets (éléments répétables). */
export function liste<T extends object>(v: unknown): Partial<T>[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is Partial<T> => x !== null && typeof x === "object" && !Array.isArray(x));
}

/** Liste de chaînes non vides. */
export function listeTextes(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(txt).filter(Boolean);
}

export function choix<T extends string | number>(v: unknown, options: readonly T[], defaut: T): T {
  return options.includes(v as T) ? (v as T) : defaut;
}

export function entier(v: unknown, min: number, max: number, defaut: number): number {
  const n = typeof v === "number" ? v : Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return defaut;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function idOuNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Identifiant unique (crypto.randomUUID n'existe que dans un contexte sécurisé). */
export function nouvelId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      /* contexte non sécurisé */
    }
  }
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
}

/** Copie profonde de données JSON. */
export function cloner<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
