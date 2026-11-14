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
  professeur?: { id: number; specialite: string | null } | null;
  eleve?: { id: number; classe: string | null } | null;
}

export interface UserCounts {
  tous: number;
  eleve: number;
  professeur: number;
  administrateur: number;
}

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
  page?: number;
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
