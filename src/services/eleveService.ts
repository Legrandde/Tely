import api from "../api/axio";
import type { AuthUser } from "./authService";
import type {
  OnboardingPayload,
  PageHistorique,
  TableauDeBordEleve,
} from "../types/eleve";

export async function getTableauDeBord(): Promise<TableauDeBordEleve> {
  const { data } = await api.get<TableauDeBordEleve>("/api/eleve/tableau-de-bord");
  return data;
}

export async function getFavoris(page = 1): Promise<PageHistorique> {
  const { data } = await api.get<PageHistorique>("/api/eleve/favoris", { params: { page } });
  return data;
}

export async function getFavorisIds(): Promise<number[]> {
  const { data } = await api.get<{ ids: Array<number | string> }>("/api/eleve/favoris/ids");
  return (data.ids ?? []).map(Number);
}

export async function basculerFavori(
  exerciceId: number
): Promise<{ favori: boolean; message: string }> {
  const { data } = await api.post<{ favori: boolean; message: string }>(
    `/api/eleve/favoris/${exerciceId}`
  );
  return data;
}

export async function getHistorique(params: {
  action?: "consulte" | "correction_vue";
  page?: number;
}): Promise<PageHistorique> {
  const { data } = await api.get<PageHistorique>("/api/eleve/historique", {
    params: { page: params.page ?? 1, ...(params.action ? { action: params.action } : {}) },
  });
  return data;
}

export async function enregistrerActivite(
  exerciceId: number,
  action: "consulte" | "correction_vue"
): Promise<void> {
  await api.post("/api/eleve/activite", { exercice_id: exerciceId, action });
}

export async function terminerOnboarding(
  payload: OnboardingPayload
): Promise<{ message: string; user: AuthUser }> {
  const { data } = await api.post<{ message: string; user: AuthUser }>(
    "/api/eleve/onboarding",
    payload
  );
  return data;
}

/** Message d'erreur lisible extrait d'une erreur axios. */
export function messageErreur(err: unknown, defaut: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? defaut
  );
}
