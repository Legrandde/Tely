import api from "../api/axio";
import type {
  Bloc,
  Page,
  PagePublique,
  PageResume,
  StatsPubliques,
  StatutPage,
} from "../features/pagebuilder/types";

// ─── Administration ──────────────────────────────────────────────────────

export interface FiltresPages {
  statut?: StatutPage | "";
  search?: string;
}

export interface DonneesPage {
  titre?: string;
  slug?: string;
  meta_description?: string | null;
  image_og?: string | null;
  blocs?: Bloc[];
  statut?: StatutPage;
  est_accueil?: boolean;
  dans_menu?: boolean;
  dans_footer?: boolean;
}

export async function listPages(filtres: FiltresPages = {}): Promise<PageResume[]> {
  const params: Record<string, string> = {};
  if (filtres.statut) params.statut = filtres.statut;
  if (filtres.search?.trim()) params.search = filtres.search.trim();
  const { data } = await api.get<{ pages: PageResume[] }>("/api/admin/pages", { params });
  return data.pages;
}

export async function getPage(id: number | string): Promise<Page> {
  const { data } = await api.get<{ page: Page }>(`/api/admin/pages/${id}`);
  return data.page;
}

export async function createPage(donnees: DonneesPage): Promise<Page> {
  const { data } = await api.post<{ message: string; page: Page }>("/api/admin/pages", donnees);
  return data.page;
}

export async function updatePage(id: number | string, donnees: DonneesPage): Promise<Page> {
  const { data } = await api.put<{ message: string; page: Page }>(`/api/admin/pages/${id}`, donnees);
  return data.page;
}

export async function duplicatePage(id: number | string): Promise<Page> {
  const { data } = await api.post<{ page: Page }>(`/api/admin/pages/${id}/dupliquer`);
  return data.page;
}

export async function deletePage(id: number | string): Promise<void> {
  await api.delete(`/api/admin/pages/${id}`);
}

// ─── Site public ─────────────────────────────────────────────────────────

export async function getPublicPage(slug: string): Promise<PagePublique> {
  const { data } = await api.get<{ page: PagePublique }>(`/api/site/pages/${encodeURIComponent(slug)}`);
  return data.page;
}

export async function getPageAccueil(): Promise<PagePublique | null> {
  const { data } = await api.get<{ page: PagePublique | null }>("/api/site/accueil");
  return data.page;
}

let statsCache: StatsPubliques | null = null;
let statsPromise: Promise<StatsPubliques> | null = null;

/** Statistiques publiques (mises en cache le temps de la session). */
export function getSiteStats(): Promise<StatsPubliques> {
  if (statsCache) return Promise.resolve(statsCache);
  if (!statsPromise) {
    statsPromise = api
      .get<{ stats: StatsPubliques }>("/api/site/stats")
      .then(({ data }) => {
        statsCache = data.stats;
        return data.stats;
      })
      .finally(() => {
        statsPromise = null;
      });
  }
  return statsPromise;
}

// ─── Erreurs ─────────────────────────────────────────────────────────────

export interface ErreurApi {
  status?: number;
  message: string;
  errors: Record<string, string[]>;
}

export function lireErreur(err: unknown, defaut = "Une erreur est survenue."): ErreurApi {
  const e = err as {
    response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
    message?: string;
  };
  return {
    status: e?.response?.status,
    message: e?.response?.data?.message || defaut,
    errors: e?.response?.data?.errors ?? {},
  };
}
