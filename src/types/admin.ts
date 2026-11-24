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
  fichier_pdf?: string | null;
  pdf_url?: string | null;
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
  /** Ce qui demande une action de l'administrateur (calculé en direct) */
  a_traiter?: {
    candidatures_en_attente: number;
    exercices_sans_corrige: number;
    exercices_inactifs: number;
    sujets_sans_exercice: number;
    nouveaux_inscrits_7j: number;
  };
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
  /** Ce qui demande une action de l'enseignant */
  a_traiter?: {
    exercices_sans_corrige: number;
    exercices_inactifs: number;
    exercices_sans_corrige_liste: Array<{ id: number; titre: string }>;
  };
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

/* ─────────────────────────────────────────────────────────────
   Back-office : journal d'audit et recherche globale
   ───────────────────────────────────────────────────────────── */

export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface JournalActeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "eleve" | "professeur" | "administrateur";
}

export interface JournalEntree {
  id: number;
  action: string;
  description: string;
  sujet_type: string | null;
  sujet_id: number | null;
  meta: Record<string, unknown> | unknown[] | null;
  ip: string | null;
  created_at: string;
  user: JournalActeur | null;
}

export interface JournalResponse {
  journal: Pagination<JournalEntree>;
  actions: string[];
}

export interface JournalFiltres {
  action?: string;
  search?: string;
  du?: string;
  au?: string;
  page?: number;
}

export interface RechercheResultats {
  utilisateurs: Array<{
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: "eleve" | "professeur" | "administrateur";
    avatar?: string | null;
    avatar_url?: string | null;
  }>;
  exercices: Array<{ id: number; titre: string; est_actif: boolean | number }>;
  sujets: Array<{ id: number; titre: string }>;
  pages: Array<{ id: number; titre: string; slug: string; statut: "brouillon" | "publie" }>;
}
