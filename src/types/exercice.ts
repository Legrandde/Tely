export interface Matiere {
  id: string;
  nom: string;
  code: string;
  description?: string;
  image?: string | null;
  image_url?: string | null;
}

export interface Niveau {
  id: string;
  libelle: string;
  cycle: string;
  ordre: number;
}

export interface Categorie {
  id: string;
  nom: string;
  [key: string]: unknown;
}

export interface Professeur {
  id: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    avatar: string | null;
    email: string;
  };
}

export type ExerciceType = "classique" | "qcm" | "probleme" | "sujet_examen";
export type Difficulte = "facile" | "moyen" | "difficile";

export interface Exercice {
  id: number;
  titre: string;
  enonce: string;
  type: ExerciceType;
  difficulte: Difficulte;
  est_actif: boolean;
  image?: string | null;
  image_url?: string | null;
  matiere: Matiere;
  niveau: Niveau;
  categorie: Categorie | null;
  professeur: Professeur;
  correction?: unknown;
  sujetsExamen?: unknown[];
  created_at?: string;
  updated_at?: string;
}

export interface ExerciceFilters {
  niveau_id?: string | number;
  matiere_id?: string | number;
  difficulte?: Difficulte;
  type?: ExerciceType;
  avec_correction?: boolean;
  q?: string;
  cycle?: string;
  serie?: string;
  tri?: string;
  page?: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}
