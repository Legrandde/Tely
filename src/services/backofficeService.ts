import api from "../api/axio";
import type { JournalFiltres, JournalResponse, RechercheResultats } from "../types/admin";

/** Journal d'audit paginé (30 entrées par page côté serveur). */
export async function fetchJournal(filtres: JournalFiltres): Promise<JournalResponse> {
  const params: Record<string, string | number> = {};
  if (filtres.action) params.action = filtres.action;
  if (filtres.search?.trim()) params.search = filtres.search.trim();
  if (filtres.du) params.du = filtres.du;
  if (filtres.au) params.au = filtres.au;
  if (filtres.page && filtres.page > 1) params.page = filtres.page;
  const { data } = await api.get<JournalResponse>("/api/admin/journal", { params });
  return data;
}

/** Recherche globale du back-office (≥ 2 caractères). */
export async function rechercheGlobale(q: string, signal?: AbortSignal): Promise<RechercheResultats> {
  const { data } = await api.get<RechercheResultats>("/api/admin/recherche", {
    params: { q },
    signal,
  });
  return {
    utilisateurs: data.utilisateurs ?? [],
    exercices: data.exercices ?? [],
    sujets: data.sujets ?? [],
    pages: data.pages ?? [],
  };
}
