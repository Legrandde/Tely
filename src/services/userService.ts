import api from "../api/axio";

export type UserRole = "eleve" | "professeur" | "administrateur";

export const ROLE_LABELS: Record<UserRole, string> = {
  eleve: "Élève",
  professeur: "Professeur",
  administrateur: "Administrateur",
};

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  est_suspendu?: boolean;
  suspendu_le?: string | null;
  motif_suspension?: string | null;
  derniere_connexion_le?: string | null;
  professeur?: { id: number; specialite: string | null } | null;
  eleve?: { id: number; classe: string | null } | null;
}

export interface UserCounts {
  tous: number;
  eleve: number;
  professeur: number;
  administrateur: number;
  suspendus?: number;
}

export type StatutFilter = "actif" | "suspendu";

export interface UsersResponse {
  users: {
    data: AdminUser[];
    current_page: number;
    last_page: number;
    total: number;
  };
  counts: UserCounts;
}

export interface CreateUserPayload {
  prenom: string;
  nom: string;
  email: string;
  role: UserRole;
  password?: string;
  specialite?: string;
}

export async function fetchUsers(params: {
  role?: UserRole;
  search?: string;
  statut?: StatutFilter;
  page?: number;
  per_page?: number;
}): Promise<UsersResponse> {
  const { data } = await api.get<UsersResponse>("/api/admin/users", { params });
  return data;
}

export async function createUser(
  payload: CreateUserPayload
): Promise<{ message: string; user: AdminUser; generated_password: string | null }> {
  const { data } = await api.post("/api/admin/users", payload);
  return data;
}

export async function updateUserRole(
  id: number,
  role: UserRole
): Promise<{ message: string; user: AdminUser }> {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
  return data;
}

export async function updateUserStatut(
  id: number,
  suspendu: boolean,
  motif?: string
): Promise<{ message: string; user: AdminUser }> {
  const { data } = await api.patch(`/api/admin/users/${id}/statut`, {
    suspendu,
    ...(suspendu && motif?.trim() ? { motif: motif.trim() } : {}),
  });
  return data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/admin/users/${id}`);
  return data;
}

/** Nom de fichier extrait de l'en-tête Content-Disposition (RFC 6266, filename* prioritaire). */
function nomFichierDepuisEntete(entete: string | undefined): string | null {
  if (!entete) return null;
  const etoile = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(entete);
  if (etoile) {
    try {
      return decodeURIComponent(etoile[1].trim().replace(/^"|"$/g, ""));
    } catch {
      /* on tente la forme simple */
    }
  }
  const simple = /filename\s*=\s*"?([^";]+)"?/i.exec(entete);
  return simple ? simple[1].trim() : null;
}

/** Télécharge l'export CSV des comptes en respectant les filtres actifs. */
export async function exportUsersCsv(params: {
  role?: UserRole;
  search?: string;
  statut?: StatutFilter;
}): Promise<string> {
  let res;
  try {
    res = await api.get<Blob>("/api/admin/users/export", {
      params,
      responseType: "blob",
      timeout: 60000,
    });
  } catch (err) {
    // Avec responseType "blob", le corps d'erreur JSON arrive sous forme de Blob : on le relit.
    const reponse = (err as { response?: { data?: unknown } }).response;
    if (reponse?.data instanceof Blob) {
      try {
        reponse.data = JSON.parse(await reponse.data.text());
      } catch {
        reponse.data = undefined;
      }
    }
    throw err;
  }
  const date = new Date().toISOString().slice(0, 10);
  const nom =
    nomFichierDepuisEntete(res.headers["content-disposition"] as string | undefined) ??
    `utilisateurs-${date}.csv`;
  const url = URL.createObjectURL(res.data);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return nom;
}
