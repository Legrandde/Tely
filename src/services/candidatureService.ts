import api from "../api/axio";

export interface CandidatureItem {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone?: string | null;
  specialite: string;
  etablissement?: string | null;
  diplome?: string | null;
  experience_annees: number;
  message?: string | null;
  cv_path?: string | null;
  cv_url?: string | null;
  statut: "en_attente" | "approuve" | "rejete";
  user_id?: number | null;
  motif_rejet?: string | null;
  created_at: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

export interface CandidatureCounts {
  total: number;
  en_attente: number;
  approuve: number;
  rejete: number;
}

export interface CandidaturesResponse {
  candidatures: {
    data: CandidatureItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
  counts: CandidatureCounts;
}

export async function submitCandidature(payload: FormData): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/api/candidatures-professeurs",
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function listCandidatures(params?: {
  statut?: string;
  q?: string;
  page?: number;
}): Promise<CandidaturesResponse> {
  const { data } = await api.get<CandidaturesResponse>("/api/admin/candidatures-professeurs", {
    params,
  });
  return data;
}

export async function approuverCandidature(
  id: number | string,
  password?: string
): Promise<{
  message: string;
  user: Record<string, unknown>;
  generated_password: string;
  candidature: CandidatureItem;
}> {
  const { data } = await api.post(`/api/admin/candidatures-professeurs/${id}/approuver`, {
    password,
  });
  return data;
}

export async function rejeterCandidature(
  id: number | string,
  motif_rejet?: string
): Promise<{ message: string; candidature: CandidatureItem }> {
  const { data } = await api.post(`/api/admin/candidatures-professeurs/${id}/rejeter`, {
    motif_rejet,
  });
  return data;
}

export async function deleteCandidature(id: number | string): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/admin/candidatures-professeurs/${id}`);
  return data;
}
