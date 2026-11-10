import api from "../api/axio";
import { getMatieres, getNiveaux, getExercices as fetchExercicesPaginated } from "./exerciceService";
import type { AdminStats, CorrectionItem, SujetItem, RessourceItem, ProfesseurStats } from "../types/admin";

// ─── Matières ───
export async function listMatieres() {
  const { data } = await api.get("/api/matieres");
  return Array.isArray(data) ? data : data.data;
}
export async function createMatiere(values: Record<string, unknown>) {
  const { data } = await api.post("/api/matieres", values);
  return data;
}
export async function updateMatiere(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/matieres/${id}`, values);
  return data;
}
export async function deleteMatiere(id: string | number) {
  await api.delete(`/api/matieres/${id}`);
}

// ─── Niveaux ───
export async function listNiveaux() {
  const { data } = await api.get("/api/niveaux");
  return Array.isArray(data) ? data : data.data;
}
export async function createNiveau(values: Record<string, unknown>) {
  const { data } = await api.post("/api/niveaux", values);
  return data;
}
export async function updateNiveau(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/niveaux/${id}`, values);
  return data;
}
export async function deleteNiveau(id: string | number) {
  await api.delete(`/api/niveaux/${id}`);
}

// ─── Catégories ───
export async function listCategories() {
  const { data } = await api.get("/api/categories");
  return Array.isArray(data) ? data : data.data;
}
export async function createCategorie(values: Record<string, unknown>) {
  const { data } = await api.post("/api/categories", values);
  return data;
}
export async function updateCategorie(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/categories/${id}`, values);
  return data;
}
export async function deleteCategorie(id: string | number) {
  await api.delete(`/api/categories/${id}`);
}

// ─── Exercices ───
export async function listExercices() {
  const result = await fetchExercicesPaginated({});
  return result.data;
}
export async function createExercice(values: Record<string, unknown>) {
  const { data } = await api.post("/api/exercices", values);
  return data;
}
export async function updateExercice(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/exercices/${id}`, values);
  return data;
}
export async function deleteExercice(id: string | number) {
  await api.delete(`/api/exercices/${id}`);
}

// ─── Sujets d'examen ───
export async function listSujets(params?: { matiere_id?: string | number; niveau_id?: string | number; annee?: number | string; type?: string }): Promise<SujetItem[]> {
  const { data } = await api.get("/api/sujets", { params });
  return Array.isArray(data) ? data : data.data;
}
export async function getSujetById(id: string | number): Promise<SujetItem> {
  const { data } = await api.get(`/api/sujets/${id}`);
  return data;
}
export async function createSujet(values: Record<string, unknown>) {
  const { data } = await api.post("/api/sujets", values);
  return data;
}
export async function updateSujet(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/sujets/${id}`, values);
  return data;
}
export async function deleteSujet(id: string | number) {
  await api.delete(`/api/sujets/${id}`);
}

// ─── Corrections ───
export async function listCorrections(): Promise<CorrectionItem[]> {
  const { data } = await api.get("/api/corrections");
  return Array.isArray(data) ? data : (data.data ?? []);
}
export async function getCorrectionByExercice(exerciceId: string | number): Promise<CorrectionItem> {
  const { data } = await api.get(`/api/exercices/${exerciceId}/correction`);
  return data;
}
export async function createCorrection(values: Record<string, unknown>) {
  const { data } = await api.post("/api/corrections", values);
  return data;
}
export async function updateCorrection(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/corrections/${id}`, values);
  return data;
}
export async function deleteCorrection(id: string | number) {
  await api.delete(`/api/corrections/${id}`);
}

// ─── Professeurs ───
export async function getProfesseurs() {
  const { data } = await api.get("/api/professeurs");
  return Array.isArray(data) ? data : data.data;
}
export async function listProfesseurs() {
  const { data } = await api.get("/api/professeurs");
  return Array.isArray(data) ? data : data.data;
}
export async function createProfesseur(values: Record<string, unknown>) {
  const { data: registerData } = await api.post("/api/auth/register", {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    password: values.password,
    password_confirmation: values.password,
    role: "professeur",
  });

  const { data: professeurData } = await api.post("/api/professeurs", {
    user_id: registerData.user.id,
    specialite: values.specialite,
  });

  return professeurData;
}
export async function updateProfesseur(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/professeurs/${id}`, {
    specialite: values.specialite,
  });
  return data;
}
export async function deleteProfesseur(id: string | number) {
  await api.delete(`/api/professeurs/${id}`);
}

// ─── Élèves ───
export async function listEleves() {
  const { data } = await api.get("/api/eleves");
  return Array.isArray(data) ? data : data.data;
}
export async function createEleve(values: Record<string, unknown>) {
  const { data: registerData } = await api.post("/api/auth/register", {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    password: values.password,
    password_confirmation: values.password,
    role: "eleve",
  });

  const { data: eleveData } = await api.post("/api/eleves", {
    user_id: registerData.user.id,
    matricule: values.matricule,
    niveau_id: values.niveau_id,
    classe: values.classe,
  });

  return eleveData;
}
export async function updateEleve(id: string | number, values: Record<string, unknown>) {
  const { data } = await api.put(`/api/eleves/${id}`, {
    matricule: values.matricule,
    niveau_id: values.niveau_id,
    classe: values.classe,
  });
  return data;
}
export async function deleteEleve(id: string | number) {
  await api.delete(`/api/eleves/${id}`);
}

// ─── Ressources pédagogiques (PDFs, Cours, Résumés) ───
export async function listRessources(params?: {
  matiere_id?: string | number;
  niveau_id?: string | number;
  type?: string;
  professeur_id?: string | number;
  q?: string;
}): Promise<RessourceItem[]> {
  const { data } = await api.get("/api/ressources", { params });
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createRessource(formData: FormData | Record<string, unknown>) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;
  const { data } = await api.post("/api/ressources", formData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
}

export async function updateRessource(id: string | number, formData: FormData | Record<string, unknown>) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;
  // In Laravel, file upload over PUT sometimes needs POST with _method=PUT
  if (isFormData && !formData.has("_method")) {
    formData.append("_method", "PUT");
    const { data } = await api.post(`/api/ressources/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await api.put(`/api/ressources/${id}`, formData);
  return data;
}

export async function deleteRessource(id: string | number) {
  await api.delete(`/api/ressources/${id}`);
}

// ─── Professeur Dashboard Stats ───
export async function getProfesseurStats(): Promise<ProfesseurStats> {
  const { data } = await api.get("/api/professeur/stats");
  return data;
}

// ─── Admin Dashboard Stats ───
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get("/api/admin/stats");
  return data;
}

// ─── Chargeurs d'options réutilisables pour les selects async ───
export async function loadMatiereOptions() {
  const matieres = await getMatieres();
  return matieres.map((m) => ({ value: String(m.id), label: m.nom }));
}

export async function loadNiveauOptions() {
  const niveaux = await getNiveaux();
  return niveaux.map((n) => ({ value: String(n.id), label: `${n.libelle} (${n.cycle})` }));
}

export async function loadCategorieOptions() {
  const categories = await listCategories();
  return (categories as Array<{ id: string | number; nom: string }>).map((c) => ({
    value: String(c.id),
    label: c.nom,
  }));
}

export async function loadProfesseurOptions() {
  const professeurs = await getProfesseurs();
  return professeurs.map((p: { id: string | number; user?: { prenom?: string; nom?: string } }) => ({
    value: String(p.id),
    label: `${p.user?.prenom ?? ""} ${p.user?.nom ?? ""}`.trim(),
  }));
}

export async function loadExerciceOptions() {
  const result = await fetchExercicesPaginated({});
  return result.data.map((ex) => ({
    value: String(ex.id),
    label: `${ex.titre} (${ex.matiere?.nom ?? ""} - ${ex.niveau?.libelle ?? ""})`,
  }));
}
