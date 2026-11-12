import type { Exercice, Matiere, Niveau, Categorie } from "./exercice";

export interface MatiereItem extends Matiere {
  exercices_count?: number;
}

export interface NiveauItem extends Niveau {
  exercices_count?: number;
}

export interface CategorieItem extends Categorie {
  couleur?: string;
  icone?: string;
  exercices_count?: number;
}

export interface CorrectionItem {
  id: number | string;
  exercice_id: number | string;
  contenu: string;
  explication?: string;
  created_at?: string;
  updated_at?: string;
  exercice?: Exercice;
}

export interface SujetItem {
  id: number | string;
  titre: string;
  annee: number;
  session: "juin" | "septembre" | "janvier";
  type: "bac" | "brevet" | "composition" | "autre";
  ennonce: string;
  enonce?: string;
  matiere_id?: number | string;
  niveau_id?: number | string;
  matiere?: { id: number | string; nom: string; code?: string };
  niveau?: { id: number | string; libelle: string; cycle?: string };
  exercices_count?: number;
  exercices?: Array<{
    id: number | string;
    titre?: string;
    pivot?: { ordre: number };
  }>;
  created_at?: string;
}

export interface RessourceItem {
  id: number | string;
  titre: string;
  description?: string;
  type: "cours" | "resume" | "fiche" | "td" | "autre";
  fichier_path: string;
  fichier_nom?: string;
  fichier_url?: string;
  format?: string;
  taille?: number;
  matiere_id?: number | string;
  niveau_id?: number | string;
  professeur_id?: number | string;
  matiere?: { id: number | string; nom: string; code?: string };
  niveau?: { id: number | string; libelle: string; cycle?: string };
  professeur?: { id: number | string; user?: { prenom?: string; nom?: string } };
  est_public?: boolean;
  created_at?: string;
}

export interface AdminStats {
  counts: {
    eleves: number;
    professeurs: number;
    exercices: number;
    sujets: number;
    matieres: number;
    niveaux: number;
    categories: number;
    corrections: number;
    users: number;
  };
  exercices_par_matiere: Array<{
    id: number | string;
    nom: string;
    code: string;
    exercices_count: number;
  }>;
  exercices_par_niveau: Array<{
    id: number | string;
    libelle: string;
    cycle: string;
    exercices_count: number;
  }>;
  exercices_par_difficulte: Record<string, number>;
  derniers_exercices: Array<{
    id: number | string;
    titre: string;
    type: string;
    difficulte: string;
    matiere?: { nom: string };
    niveau?: { libelle: string };
    created_at: string;
  }>;
  derniers_utilisateurs: Array<{
    id: number | string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    avatar?: string | null;
    created_at: string;
  }>;
  derniers_sujets: Array<{
    id: number | string;
    titre: string;
    type: string;
    annee: number;
    session: string;
    matiere?: { nom: string };
    niveau?: { libelle: string };
    created_at: string;
  }>;
}

export interface ProfesseurStats {
  professeur?: {
    id: number | string;
    specialite?: string;
    user?: {
      id: number | string;
      nom: string;
      prenom: string;
      email: string;
      avatar?: string;
    };
  } | null;
  counts: {
    mes_exercices: number;
    mes_ressources: number;
    sujets: number;
    corrections: number;
  };
  derniers_exercices: Array<{
    id: number | string;
    titre: string;
    type: string;
    difficulte: string;
    matiere?: { nom: string };
    niveau?: { libelle: string };
    correction?: { id: number | string };
    created_at: string;
  }>;
  dernieres_ressources: Array<RessourceItem>;
  derniers_sujets: Array<{
    id: number | string;
    titre: string;
    type: string;
    annee: number;
    session: string;
    matiere?: { nom: string };
    niveau?: { libelle: string };
    created_at: string;
  }>;
}
