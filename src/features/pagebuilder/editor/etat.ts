/**
 * État de l'éditeur : document édité + historique (annuler / rétablir).
 */
import type { Bloc, Page, TypeBloc } from "../types";
import { TYPES_BLOCS } from "../registry";

export interface DocEditeur {
  titre: string;
  slug: string;
  meta_description: string;
  image_og: string;
  est_accueil: boolean;
  dans_menu: boolean;
  dans_footer: boolean;
  blocs: Bloc[];
}

export function normaliserBlocs(blocs: unknown): Bloc[] {
  if (!Array.isArray(blocs)) return [];
  return blocs
    .filter((b): b is Bloc => !!b && typeof b === "object" && TYPES_BLOCS.includes((b as Bloc).type as TypeBloc))
    .map((b) => ({
      id: String(b.id),
      type: b.type,
      props: b.props && typeof b.props === "object" && !Array.isArray(b.props) ? b.props : {},
      masque: !!b.masque,
    }));
}

export function docDepuisPage(page: Page): DocEditeur {
  return {
    titre: page.titre ?? "",
    slug: page.slug ?? "",
    meta_description: page.meta_description ?? "",
    image_og: page.image_og ?? "",
    est_accueil: !!page.est_accueil,
    dans_menu: !!page.dans_menu,
    dans_footer: !!page.dans_footer,
    blocs: normaliserBlocs(page.blocs),
  };
}

/** Document minimal manipulé par l'éditeur de blocs (page, article…). */
export interface DocAvecBlocs {
  blocs: Bloc[];
}

export const serialiser = <D = DocEditeur>(d: D) => JSON.stringify(d);

// ─── Historique ───────────────────────────────────────────────────────────

const LIMITE_HISTORIQUE = 100;
const DELAI_FUSION_MS = 900;

export interface Historique<D = DocEditeur> {
  passe: D[];
  present: D;
  futur: D[];
  /** Clé de fusion de la dernière modification (frappes successives dans un même champ). */
  derniereCle: string | null;
  derniereDate: number;
}

export type ActionHistorique<D = DocEditeur> =
  | { type: "modifier"; doc: D; cle?: string; date: number }
  | { type: "annuler" }
  | { type: "retablir" }
  | { type: "reinitialiser"; doc: D }
  /** Remplace le présent sans l'ajouter à l'historique (synchronisation serveur). */
  | { type: "remplacer"; doc: D };

export function historiqueInitial<D = DocEditeur>(doc: D): Historique<D> {
  return { passe: [], present: doc, futur: [], derniereCle: null, derniereDate: 0 };
}

export function reducteurHistorique<D = DocEditeur>(h: Historique<D>, a: ActionHistorique<D>): Historique<D> {
  switch (a.type) {
    case "modifier": {
      if (a.doc === h.present) return h;
      const fusion = !!a.cle && a.cle === h.derniereCle && a.date - h.derniereDate < DELAI_FUSION_MS;
      return {
        passe: fusion ? h.passe : [...h.passe, h.present].slice(-LIMITE_HISTORIQUE),
        present: a.doc,
        futur: [],
        derniereCle: a.cle ?? null,
        derniereDate: a.date,
      };
    }
    case "annuler": {
      if (h.passe.length === 0) return h;
      const precedent = h.passe[h.passe.length - 1];
      return {
        passe: h.passe.slice(0, -1),
        present: precedent,
        futur: [h.present, ...h.futur],
        derniereCle: null,
        derniereDate: 0,
      };
    }
    case "retablir": {
      if (h.futur.length === 0) return h;
      const [suivant, ...reste] = h.futur;
      return {
        passe: [...h.passe, h.present],
        present: suivant,
        futur: reste,
        derniereCle: null,
        derniereDate: 0,
      };
    }
    case "reinitialiser":
      return historiqueInitial<D>(a.doc);
    case "remplacer":
      return { ...h, present: a.doc, derniereCle: null };
  }
}

// ─── Opérations sur les blocs ─────────────────────────────────────────────

export function deplacer<T>(liste: T[], de: number, vers: number): T[] {
  if (de === vers || de < 0 || de >= liste.length) return liste;
  const copie = [...liste];
  const [el] = copie.splice(de, 1);
  copie.splice(Math.max(0, Math.min(vers, copie.length)), 0, el);
  return copie;
}

export function inserer<T>(liste: T[], index: number, el: T): T[] {
  const copie = [...liste];
  copie.splice(Math.max(0, Math.min(index, copie.length)), 0, el);
  return copie;
}

// ─── Aperçu responsive ────────────────────────────────────────────────────

export type Appareil = "desktop" | "tablette" | "mobile";

export const LARGEURS: Record<Appareil, number | null> = { desktop: null, tablette: 768, mobile: 375 };
