import type { Bloc, Pagination } from "../features/pagebuilder/types";

export type { Pagination };

export type CouleurCategorie = "amber" | "emerald" | "sky" | "violet" | "rose" | "gray";
export type StatutArticle = "brouillon" | "publie";
/** Filtre de statut de la liste d'administration (« programme » = publié avec une date future). */
export type FiltreStatutArticle = "" | "publie" | "programme" | "brouillon";

export interface CategorieResume {
  id: number;
  nom: string;
  slug: string;
  couleur: CouleurCategorie | null;
}

export interface CategorieBlog extends CategorieResume {
  description: string | null;
  ordre: number;
  articles_count: number;
}

export interface TagBlog {
  tag: string;
  total: number;
}

export interface AuteurArticle {
  id: number;
  nom: string;
  prenom: string;
  avatar: string | null;
  avatar_url: string | null;
  nom_complet: string;
}

export interface ArticleCarte {
  id: number;
  titre: string;
  slug: string;
  extrait: string | null;
  image_couverture: string | null;
  tags: string[] | null;
  publie_le: string | null;
  mis_en_avant: boolean;
  temps_lecture: number;
  vues: number;
  categorie_blog_id: number | null;
  auteur_id: number | null;
  statut: StatutArticle;
  est_programme: boolean;
  categorie: CategorieResume | null;
  auteur: AuteurArticle | null;
}

/** Article public complet (`GET /api/blog/articles/{slug}`). */
export interface Article extends ArticleCarte {
  blocs: Bloc[];
  meta_description: string | null;
}

/** Ligne de la liste d'administration. */
export interface ArticleAdminResume extends ArticleCarte {
  updated_at: string;
}

/** Article en édition (`GET /api/admin/articles/{id}`, blocs masqués inclus). */
export interface ArticleAdmin extends Article {
  updated_at: string;
  created_at?: string;
}

export interface CompteursArticles {
  tous: number;
  publie: number;
  programme: number;
  brouillon: number;
}

export interface DonneesArticle {
  titre?: string;
  slug?: string;
  extrait?: string | null;
  image_couverture?: string | null;
  meta_description?: string | null;
  statut?: StatutArticle;
  publie_le?: string | null;
  mis_en_avant?: boolean;
  categorie_blog_id?: number | null;
  tags?: string[];
  blocs?: Bloc[];
}

export interface DonneesCategorie {
  nom: string;
  slug?: string;
  description?: string | null;
  couleur?: CouleurCategorie | null;
  ordre?: number | null;
}
