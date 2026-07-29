import api from "../api/axio"; // adapte le chemin vers ton instance axios
import { setAccess, clearAccess } from "../utils/storage";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  avatar: string | null;
  role: "eleve" | "professeur" | "administrateur";
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

// =================================== pour la réinitialisation du mot de pas =================
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