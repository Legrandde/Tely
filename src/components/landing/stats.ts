import type { StatsPubliques } from "../../types/site";

/**
 * Arrondi « marketing » vers le bas : 1 234 → 1 200 (affiché « 1 200+ »).
 * En dessous de 10, la statistique n'est pas affichée (preuve sociale contre-productive).
 */
export function arrondiStat(n: number | null | undefined): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 10) return null;
  const pas = n < 100 ? 10 : n < 1000 ? 50 : n < 10000 ? 100 : 1000;
  return Math.floor(n / pas) * pas;
}

const formateur = new Intl.NumberFormat("fr-FR");

export function formatStat(n: number): string {
  return formateur.format(n);
}

export interface StatAffichee {
  cle: keyof StatsPubliques;
  valeur: number;
  libelle: string;
}

const LIBELLES: { cle: keyof StatsPubliques; libelle: string }[] = [
  { cle: "exercices", libelle: "exercices" },
  { cle: "sujets", libelle: "sujets d'examen" },
  { cle: "corrections", libelle: "corrigés détaillés" },
  { cle: "eleves", libelle: "élèves inscrits" },
  { cle: "professeurs", libelle: "enseignants" },
  { cle: "matieres", libelle: "matières" },
];

/** Les statistiques présentables (≥ 10), dans l'ordre de priorité, limitées à `max`. */
export function statsAffichables(stats: StatsPubliques | null, max = 4): StatAffichee[] {
  if (!stats) return [];
  const resultat: StatAffichee[] = [];
  for (const { cle, libelle } of LIBELLES) {
    const valeur = arrondiStat(stats[cle]);
    if (valeur !== null) resultat.push({ cle, valeur, libelle });
    if (resultat.length >= max) break;
  }
  return resultat;
}
