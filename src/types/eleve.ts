import type { Difficulte, ExerciceType, PaginatedResponse } from "./exercice";

/** Forme allégée d'un exercice renvoyée par l'espace élève (cartes). */
export interface ExerciceCarte {
  id: number;
  titre: string;
  type: ExerciceType;
  difficulte: Difficulte;
  image: string | null;
  image_url?: string | null;
  matiere_id: number;
  niveau_id: number;
  categorie_id: number | null;
  created_at: string;
  matiere: { id: number; nom: string } | null;
  niveau: { id: number; libelle: string } | null;
}

export type ActionHistorique = "consulte" | "correction_vue" | "favori";

export interface EntreeHistorique {
  id: number;
  exercice_id: number;
  action: ActionHistorique;
  date_consultation: string;
  exercice: ExerciceCarte | null;
}

export type ObjectifEleve = "examen" | "remise_a_niveau" | "approfondir" | "autre";

export interface ProfilEleve {
  id: number;
  niveau_id: number | null;
  classe: string | null;
  matieres_preferees: number[] | null;
  objectif: ObjectifEleve | null;
  niveau: { id: number; libelle: string; cycle: string } | null;
}

export interface StatsEleve {
  exercices_consultes: number;
  corrections_vues: number;
  favoris: number;
  serie_jours: number;
}

export interface ActiviteJour {
  date: string; // YYYY-MM-DD
  total: number;
}

export interface MatiereTravaillee {
  id: number;
  nom: string;
  total: number;
}

export interface TableauDeBordEleve {
  eleve: ProfilEleve;
  onboarding_fait: boolean;
  stats: StatsEleve;
  activite: ActiviteJour[];
  matieres: MatiereTravaillee[];
  recents: EntreeHistorique[];
  recommandations: ExerciceCarte[];
}

export interface OnboardingPayload {
  niveau_id: number;
  classe?: string;
  matieres?: number[];
  objectif?: ObjectifEleve;
}

export type PageHistorique = PaginatedResponse<EntreeHistorique>;
