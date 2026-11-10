import api from "../api/axio";
import { setAccess, clearAccess } from "../utils/storage";

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  avatar: string | null;
  avatar_url?: string | null;
  role: "eleve" | "professeur" | "administrateur";
  professeur?: {
    id: number;
    specialite?: string;
  } | null;
  eleve?: {
    id: number;
    matricule?: string;
    classe?: string;
    niveau_id?: number;
    niveau?: {
      id: number;
      nom: string;
    };
  } | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
  setAccess(data.token);
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    clearAccess();
  }
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}

export function loginWithGoogle(): void {
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
}

export async function loginWithGoogleOneTap(credential: string): Promise<AuthUser> {
  const { data } = await api.post<LoginResponse>("/api/auth/google/one-tap", { credential });
  setAccess(data.token);
  return data.user;
}

interface RegisterPayload {
  nom: string;
  prenom?: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "eleve" | "professeur" | "administrateur";
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await api.post<LoginResponse>("/api/auth/register", payload);
  setAccess(data.token);
  return data.user;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post("/api/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await api.post("/api/auth/reset-password", payload);
  return data;
}

export async function updateProfile(
  payload: FormData | Record<string, unknown>
): Promise<{ message: string; user: AuthUser }> {
  const isFormData = payload instanceof FormData;
  const { data } = await api.post<{ message: string; user: AuthUser }>(
    "/api/auth/profile",
    payload,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  );
  return data;
}

export async function updatePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>("/api/auth/password", payload);
  return data;
}
