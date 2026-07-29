import api from "../api/axio";
import { getMatieres, getNiveaux, getExercices as fetchExercicesPaginated } from "./exerciceService";

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

// ─── Professeurs (liste pour les selects) ───
export async function getProfesseurs() {
  const { data } = await api.get("/api/professeurs");
  return Array.isArray(data) ? data : data.data;
}

// ─── Élèves (création en 2 étapes : compte user puis profil élève) ───
export async function listEleves() {
  const { data } = await api.get("/api/eleves");
  return Array.isArray(data) ? data : data.data;
}

export async function createEleve(values: Record<string, unknown>) {
  // 1. crée le compte utilisateur
  const { data: registerData } = await api.post("/api/auth/register", {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    password: values.password,
    password_confirmation: values.password,
    role: "eleve",
  });

  // 2. crée le profil élève rattaché à ce user
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

// ─── Chargeurs d'options réutilisables pour les selects async ───
export async function loadMatiereOptions() {
  const matieres = await getMatieres();
  return matieres.map((m) => ({ value: m.id, label: m.nom }));
}

export async function loadNiveauOptions() {
  const niveaux = await getNiveaux();
  return niveaux.map((n) => ({ value: n.id, label: `${n.libelle} (${n.cycle})` }));
}

export async function loadProfesseurOptions() {
  const professeurs = await getProfesseurs();
  return professeurs.map((p: { id: string | number; user?: { prenom?: string; nom?: string } }) => ({
    value: p.id,
    label: `${p.user?.prenom ?? ""} ${p.user?.nom ?? ""}`.trim(),
  }));
}

// ─── Professeurs ───
export async function listProfesseurs() {
  const { data } = await api.get("/api/professeurs");
  return Array.isArray(data) ? data : data.data;
}

export async function createProfesseur(values: Record<string, unknown>) {
  // 1. crée le compte utilisateur
  const { data: registerData } = await api.post("/api/auth/register", {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    password: values.password,
    password_confirmation: values.password,
    role: "professeur",
  });

  // 2. crée le profil professeur rattaché à ce user
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