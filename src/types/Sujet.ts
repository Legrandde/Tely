export interface SujetInterface {
  id: string | number;
  titre: string;
  annee: string | number;
  session: string;
  type: string;
  matiere: { id?: string | number; nom: string; code?: string };
  niveau: { id?: string | number; libelle: string; cycle?: string };
  ennonce?: string;
  enonce?: string;
  fichier_pdf?: string;
}

export interface SujetExercice {
  id: string;
  ordre: number;
  titre?: string;
  enonce?: string;
  ennonce?: string;
  correction?: {
    contenu?: string;
    explication?: string;
  };
}

export interface Sujet {
  id: string;
  titre: string;
  annee: number;
  session: "juin" | "septembre" | "janvier";
  type: "bac" | "brevet" | "composition" | "autre";
  ennonce?: string;
  enonce?: string;
  fichier_pdf?: string;
  pdf_url?: string | null;
  est_actif?: boolean;
  matiere: { id: string; nom: string };
  niveau: { id: string; libelle: string };
  professeur?: {
    user?: {
      nom: string;
      prenom: string;
      avatar?: string;
    };
  };
  exercices: SujetExercice[];
}
