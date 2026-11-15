import api from "../api/axio";
import type {
  Article,
  ArticleAdmin,
  ArticleAdminResume,
  ArticleCarte,
  CategorieBlog,
  CompteursArticles,
  DonneesArticle,
  DonneesCategorie,
  FiltreStatutArticle,
  Pagination,
  TagBlog,
} from "../types/blog";

export { lireErreur } from "./pageService";

/** URL absolue du flux RSS (servi par le backend). */
export const URL_RSS = `${(import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")}/api/blog/rss.xml`;

// ─── Public ──────────────────────────────────────────────────────────────

export interface FiltresBlog {
  categorie?: string;
  tag?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ListeArticles {
  articles: Pagination<ArticleCarte>;
  a_la_une: ArticleCarte | null;
}

export async function listArticles(filtres: FiltresBlog = {}, signal?: AbortSignal): Promise<ListeArticles> {
  const params: Record<string, string | number> = {};
  if (filtres.categorie) params.categorie = filtres.categorie;
  if (filtres.tag) params.tag = filtres.tag;
  if (filtres.search?.trim()) params.search = filtres.search.trim();
  if (filtres.page && filtres.page > 1) params.page = filtres.page;
  if (filtres.per_page) params.per_page = filtres.per_page;
  const { data } = await api.get<ListeArticles>("/api/blog/articles", { params, signal });
  return data;
}

export async function getArticle(slug: string): Promise<{ article: Article; similaires: ArticleCarte[] }> {
  const { data } = await api.get<{ article: Article; similaires: ArticleCarte[] }>(`/api/blog/articles/${encodeURIComponent(slug)}`);
  return { article: data.article, similaires: Array.isArray(data.similaires) ? data.similaires : [] };
}

export async function getCategoriesBlog(): Promise<{ categories: CategorieBlog[]; tags: TagBlog[] }> {
  const { data } = await api.get<{ categories: CategorieBlog[]; tags: TagBlog[] }>("/api/blog/categories");
  return { categories: data.categories ?? [], tags: data.tags ?? [] };
}

// ─── Administration : articles ───────────────────────────────────────────

export interface FiltresArticlesAdmin {
  statut?: FiltreStatutArticle;
  search?: string;
  categorie_blog_id?: number | "";
  page?: number;
}

export async function listArticlesAdmin(
  filtres: FiltresArticlesAdmin = {}
): Promise<{ articles: Pagination<ArticleAdminResume>; counts: CompteursArticles }> {
  const params: Record<string, string | number> = {};
  if (filtres.statut) params.statut = filtres.statut;
  if (filtres.search?.trim()) params.search = filtres.search.trim();
  if (filtres.categorie_blog_id) params.categorie_blog_id = filtres.categorie_blog_id;
  if (filtres.page && filtres.page > 1) params.page = filtres.page;
  const { data } = await api.get<{ articles: Pagination<ArticleAdminResume>; counts: CompteursArticles }>("/api/admin/articles", { params });
  return data;
}

export async function getArticleAdmin(id: number | string): Promise<ArticleAdmin> {
  const { data } = await api.get<{ article: ArticleAdmin }>(`/api/admin/articles/${id}`);
  return data.article;
}

export async function createArticle(donnees: DonneesArticle): Promise<ArticleAdmin> {
  const { data } = await api.post<{ article: ArticleAdmin }>("/api/admin/articles", donnees);
  return data.article;
}

export async function updateArticle(id: number | string, donnees: DonneesArticle): Promise<ArticleAdmin> {
  const { data } = await api.put<{ article: ArticleAdmin }>(`/api/admin/articles/${id}`, donnees);
  return data.article;
}

export async function duplicateArticle(id: number | string): Promise<ArticleAdmin> {
  const { data } = await api.post<{ article: ArticleAdmin }>(`/api/admin/articles/${id}/dupliquer`);
  return data.article;
}

export async function deleteArticle(id: number | string): Promise<void> {
  await api.delete(`/api/admin/articles/${id}`);
}

// ─── Administration : catégories ─────────────────────────────────────────

export async function createCategorieBlog(donnees: DonneesCategorie): Promise<CategorieBlog> {
  const { data } = await api.post<{ categorie: CategorieBlog }>("/api/admin/blog-categories", donnees);
  return data.categorie;
}

export async function updateCategorieBlog(id: number, donnees: DonneesCategorie): Promise<CategorieBlog> {
  const { data } = await api.put<{ categorie: CategorieBlog }>(`/api/admin/blog-categories/${id}`, donnees);
  return data.categorie;
}

export async function deleteCategorieBlog(id: number): Promise<void> {
  await api.delete(`/api/admin/blog-categories/${id}`);
}
