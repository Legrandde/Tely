import api from "../api/axio";
import type { Exercice, ExerciceFilters, Matiere, Niveau, PaginatedResponse } from "../types/exercice";

let cachedMatieres: Matiere[] | null = null;
let matieresPromise: Promise<Matiere[]> | null = null;

let cachedNiveaux: Niveau[] | null = null;
let niveauxPromise: Promise<Niveau[]> | null = null;

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

export async function getMatieres(forceRefresh = false): Promise<Matiere[]> {
  if (!forceRefresh && cachedMatieres) {
    return cachedMatieres;
  }
  if (!forceRefresh && matieresPromise) {
    return matieresPromise;
  }

  matieresPromise = api
    .get<Matiere[] | { data: Matiere[] }>("/api/matieres")
    .then((res) => {
      const result = Array.isArray(res.data) ? res.data : res.data.data;
      cachedMatieres = result;
      return result;
    })
    .finally(() => {
      matieresPromise = null;
    });

  return matieresPromise;
}

export async function getNiveaux(forceRefresh = false): Promise<Niveau[]> {
  if (!forceRefresh && cachedNiveaux) {
    return cachedNiveaux;
  }
  if (!forceRefresh && niveauxPromise) {
    return niveauxPromise;
  }

  niveauxPromise = api
    .get<Niveau[] | { data: Niveau[] }>("/api/niveaux")
    .then((res) => {
      const result = Array.isArray(res.data) ? res.data : res.data.data;
      cachedNiveaux = result;
      return result;
    })
    .finally(() => {
      niveauxPromise = null;
    });

  return niveauxPromise;
}

export function invalidateReferenceCache(): void {
  cachedMatieres = null;
  cachedNiveaux = null;
}
