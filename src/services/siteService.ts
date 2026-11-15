import api from "../api/axio";
import type { Exercice, PaginatedResponse } from "../types/exercice";
import type {
  LienNavigation,
  NavigationSite,
  PagePublique,
  ParametresPublics,
  StatsPubliques,
} from "../types/site";

export async function getParametresPublics(): Promise<ParametresPublics> {
  const { data } = await api.get<{ parametres: ParametresPublics }>("/api/site/parametres");
  return data.parametres;
}

export async function getStatsPubliques(): Promise<StatsPubliques> {
  const { data } = await api.get<{ stats: StatsPubliques }>("/api/site/stats");
  return data.stats;
}

function nettoyerLiens(liste: unknown): LienNavigation[] {
  if (!Array.isArray(liste)) return [];
  return liste.filter(
    (l): l is LienNavigation =>
      !!l &&
      typeof (l as LienNavigation).titre === "string" &&
      typeof (l as LienNavigation).slug === "string" &&
      /^[a-z0-9-]+$/.test((l as LienNavigation).slug)
  );
}

export async function getNavigationSite(): Promise<NavigationSite> {
  const { data } = await api.get<Partial<NavigationSite>>("/api/site/navigation");
  return { menu: nettoyerLiens(data?.menu), footer: nettoyerLiens(data?.footer) };
}

export async function getPageAccueil(signal?: AbortSignal): Promise<PagePublique | null> {
  const { data } = await api.get<{ page: PagePublique | null }>("/api/site/accueil", { signal });
  const page = data?.page ?? null;
  if (!page || !Array.isArray(page.blocs) || page.blocs.length === 0) return null;
  return page;
}

/** Exercices les plus récents pour l'aperçu de la page d'accueil. */
export async function getExercicesRecents(nombre = 6): Promise<Exercice[]> {
  const { data } = await api.get<PaginatedResponse<Exercice> | Exercice[]>("/api/exercices", {
    params: { per_page: nombre, tri: "recent", page: 1 },
  });
  const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return items.slice(0, nombre);
}
