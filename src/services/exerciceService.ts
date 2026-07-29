import api from "../api/axio";
import type { Exercice, ExerciceFilters, Matiere, Niveau, PaginatedResponse } from "../types/exercice";

export async function getExercices(
  filters: ExerciceFilters = {}
): Promise<PaginatedResponse<Exercice>> {
  const { data } = await api.get<PaginatedResponse<Exercice>>("/api/exercices", {
    params: filters,
  });
  return data;
}

export async function getExercice(id: string): Promise<Exercice> {
  const { data } = await api.get<Exercice>(`/api/exercices/${id}`);
  return data;
}

export async function getMatieres(): Promise<Matiere[]> {
  const { data } = await api.get<Matiere[] | { data: Matiere[] }>("/api/matieres");
  return Array.isArray(data) ? data : data.data;
}

export async function getNiveaux(): Promise<Niveau[]> {
  const { data } = await api.get<Niveau[] | { data: Niveau[] }>("/api/niveaux");
  return Array.isArray(data) ? data : data.data;
}