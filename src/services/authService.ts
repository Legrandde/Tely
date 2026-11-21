import api from "../api/axio";
import { setAccess, clearAccess } from "../utils/storage";
import { cheminInterneSur } from "../utils/liens";

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  avatar: string | null;
  avatar_url?: string | null;
  role: "eleve" | "professeur" | "administrateur";
  nom_complet?: string;
  est_suspendu?: boolean;
  derniere_connexion_le?: string | null;
  onboarding_termine_le?: string | null;
  created_at?: string;
  professeur?: {
    id: number;
    specialite?: string;
  } | null;
  eleve?: {
    id: number;
    matricule?: string;
    classe?: string;
    niveau_id?: number | null;
    matieres_preferees?: number[] | null;
    objectif?: "examen" | "remise_a_niveau" | "approfondir" | "autre" | null;
    niveau?: {
      id: number;
      libelle?: string;
      cycle?: string;
      /** Ancien nom de champ, conservé pour compatibilité */
      nom?: string;
    } | null;
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

const CLE_NONCE_GOOGLE = "tely:google-oauth-nonce";

/**
 * Lance la connexion Google. Un nonce aléatoire est gardé dans l'onglet et transmis au serveur :
 * au retour, le callback refuse tout jeton qui ne porte pas ce même nonce (un lien de callback
 * forgé par un tiers ne peut donc pas connecter la victime sur un autre compte).
 */
export function loginWithGoogle(): void {
  const octets = new Uint8Array(24);
  crypto.getRandomValues(octets);
  const nonce = Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
  try {
    sessionStorage.setItem(CLE_NONCE_GOOGLE, nonce);
  } catch {
    // stockage indisponible : le callback refusera la connexion, faute de nonce
  }
  const apiBase = String(import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  window.location.href = `${apiBase}/api/auth/google?nonce=${nonce}`;
}

/** Vérifie puis consomme (usage unique) le nonce de la connexion Google en cours. */
export function verifierNonceGoogle(recu: string | null): boolean {
  let attendu: string | null;
  try {
    attendu = sessionStorage.getItem(CLE_NONCE_GOOGLE);
    sessionStorage.removeItem(CLE_NONCE_GOOGLE);
  } catch {
    return false;
  }
  return !!attendu && !!recu && attendu === recu;
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

// ─── Redirection après authentification ────────────────────────────────

/** Zones réservées à un rôle : un `from` pointant ailleurs que son espace est ignoré. */
const ZONES_PAR_ROLE: Array<{ prefixe: string; roles: AuthUser["role"][] }> = [
  { prefixe: "/espace", roles: ["eleve"] },
  { prefixe: "/dashbord-admin", roles: ["administrateur"] },
  { prefixe: "/dashboard-professeur", roles: ["professeur", "administrateur"] },
  { prefixe: "/page-builder", roles: ["administrateur"] },
];

/** Normalise `location.state.from` (chaîne ou objet Location) en chemin interne sûr. */
export function extraireCheminFrom(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  let chemin: string | null = null;
  if (typeof from === "string") {
    chemin = from;
  } else if (from && typeof from === "object" && "pathname" in from) {
    const loc = from as { pathname: string; search?: string; hash?: string };
    chemin = `${loc.pathname}${loc.search || ""}${loc.hash || ""}`;
  }
  // Uniquement des chemins internes (pas de « //domaine », « /\domaine » ni d'URL absolue), hors pages d'auth
  if (!cheminInterneSur(chemin)) return null;
  if (chemin.toLowerCase().startsWith("/auth")) return null;
  return chemin;
}

/**
 * Destination après connexion / inscription :
 * élève → page d'origine si présente, sinon /espace ; professeur → /Dashboard-professeur ;
 * administrateur → /Dashbord-admin.
 */
export function cheminApresConnexion(user: Pick<AuthUser, "role">, from?: string | null): string {
  if (user.role === "professeur") return "/Dashboard-professeur";
  if (user.role === "administrateur") return "/Dashbord-admin";
  if (from) {
    const bas = from.toLowerCase();
    const zone = ZONES_PAR_ROLE.find((z) => bas.startsWith(z.prefixe));
    if (!zone || zone.roles.includes(user.role)) return from;
  }
  return "/espace";
}

/** Code métier renvoyé par l'API (`compte_suspendu`, `inscriptions_fermees`…). */
export function codeErreurApi(err: unknown): string | null {
  const data = (err as { response?: { data?: { code?: unknown } } })?.response?.data;
  return typeof data?.code === "string" ? data.code : null;
}

// ─── RGPD : export & suppression du compte ─────────────────────────────

/** Télécharge les données personnelles (GET /api/auth/export) dans un fichier .json. */
export async function exporterMesDonnees(): Promise<void> {
  const { data } = await api.get<unknown>("/api/auth/export", { timeout: 30000 });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `tely-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Supprime définitivement le compte (DELETE /api/auth/compte). */
export async function supprimerMonCompte(payload: {
  confirmation: string;
  password?: string;
}): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>("/api/auth/compte", { data: payload });
  clearAccess();
  return data;
}
