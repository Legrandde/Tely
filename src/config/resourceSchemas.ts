import type { ResourceSchema } from "../types/forms";
import {
  createMatiere, updateMatiere, listMatieres, deleteMatiere,
  createNiveau, updateNiveau, listNiveaux, deleteNiveau,
  createCategorie, updateCategorie, listCategories, deleteCategorie,
  createExercice, updateExercice, listExercices, deleteExercice,
  createEleve, updateEleve, listEleves, deleteEleve,
  createProfesseur, updateProfesseur, listProfesseurs, deleteProfesseur,
  loadMatiereOptions, loadNiveauOptions, loadProfesseurOptions,
} from "../services/resourceService";

export const matiereSchema: ResourceSchema = {
  key: "matiere",
  title: "Matière",
  fields: [
    { name: "nom", label: "Nom", type: "text", required: true, placeholder: "Mathématiques" },
    { name: "code", label: "Code", type: "text", required: true, placeholder: "MATH" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  columns: [
    { key: "nom", label: "Nom" },
    { key: "code", label: "Code" },
  ],
  list: listMatieres,
  create: createMatiere,
  update: updateMatiere,
  remove: deleteMatiere,
  toFormValues: (item) => ({ nom: item.nom, code: item.code, description: item.description }),
};

export const niveauSchema: ResourceSchema = {
  key: "niveau",
  title: "Niveau",
  fields: [
    { name: "libelle", label: "Libellé", type: "text", required: true, placeholder: "Terminale" },
    {
      name: "cycle",
      label: "Cycle",
      type: "select",
      required: true,
      options: [
        { value: "Collège", label: "Collège" },
        { value: "Lycée", label: "Lycée" },
      ],
    },
    { name: "ordre", label: "Ordre d'affichage", type: "number", required: true },
  ],
  columns: [
    { key: "libelle", label: "Libellé" },
    { key: "cycle", label: "Cycle" },
    { key: "ordre", label: "Ordre" },
  ],
  list: listNiveaux,
  create: createNiveau,
  update: updateNiveau,
  remove: deleteNiveau,
  toFormValues: (item) => ({ libelle: item.libelle, cycle: item.cycle, ordre: item.ordre }),
};

export const categorieSchema: ResourceSchema = {
  key: "categorie",
  title: "Catégorie",
  fields: [
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "couleur", label: "Couleur", type: "text", placeholder: "#f59e0b" },
    { name: "icone", label: "Icône", type: "text", placeholder: "book" },
  ],
  columns: [
    { key: "nom", label: "Nom" },
    { key: "couleur", label: "Couleur" },
  ],
  list: listCategories,
  create: createCategorie,
  update: updateCategorie,
  remove: deleteCategorie,
  toFormValues: (item) => ({ nom: item.nom, couleur: item.couleur, icone: item.icone }),
};

export const exerciceSchema: ResourceSchema = {
  key: "exercice",
  title: "Exercice",
  fields: [
    { name: "titre", label: "Titre", type: "text", required: true },
    { name: "enonce", label: "Énoncé", type: "textarea", required: true },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "classique", label: "Exercice classique" },
        { value: "qcm", label: "QCM" },
        { value: "probleme", label: "Problème" },
        { value: "sujet_examen", label: "Sujet d'examen" },
      ],
    },
    {
      name: "difficulte",
      label: "Difficulté",
      type: "select",
      required: true,
      options: [
        { value: "facile", label: "Facile" },
        { value: "moyen", label: "Moyen" },
        { value: "difficile", label: "Difficile" },
      ],
    },
    { name: "matiere_id", label: "Matière", type: "select-async", required: true, loadOptions: loadMatiereOptions },
    { name: "niveau_id", label: "Niveau", type: "select-async", required: true, loadOptions: loadNiveauOptions },
    { name: "categorie_id", label: "Catégorie", type: "select-async", loadOptions: async () => [] },
    { name: "professeur_id", label: "Professeur", type: "select-async", required: true, loadOptions: loadProfesseurOptions },
    { name: "est_actif", label: "Actif", type: "checkbox" },
  ],
  columns: [
    { key: "titre", label: "Titre" },
    { key: "matiere", label: "Matière", render: (item: Record<string, unknown>) => (item.matiere as { nom?: string })?.nom },
    { key: "niveau", label: "Niveau", render: (item: Record<string, unknown>) => (item.niveau as { libelle?: string })?.libelle },
    { key: "difficulte", label: "Difficulté" },
  ],
  list: listExercices,
  create: createExercice,
  update: updateExercice,
  remove: deleteExercice,
  toFormValues: (item: Record<string, unknown>) => {
    const raw = item as Record<string, { id?: string | number } | string | number | boolean>;
    return {
      titre: raw.titre,
      enonce: raw.enonce,
      type: raw.type,
      difficulte: raw.difficulte,
      matiere_id: typeof raw.matiere === "object" ? raw.matiere?.id : undefined,
      niveau_id: typeof raw.niveau === "object" ? raw.niveau?.id : undefined,
      categorie_id: typeof raw.categorie === "object" ? raw.categorie?.id : undefined,
      professeur_id: typeof raw.professeur === "object" ? raw.professeur?.id : undefined,
      est_actif: raw.est_actif,
    };
  },
};

export const eleveSchema: ResourceSchema = {
  key: "eleve",
  title: "Élève",
  fields: [
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "prenom", label: "Prénom", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "password", label: "Mot de passe", type: "text", required: true, helperText: "Généré ou choisi pour le nouveau compte" },
    { name: "matricule", label: "Matricule", type: "text", required: true },
    { name: "niveau_id", label: "Niveau", type: "select-async", required: true, loadOptions: loadNiveauOptions },
    { name: "classe", label: "Classe", type: "text", required: true, placeholder: "TleS2" },
  ],
  columns: [
    { key: "matricule", label: "Matricule" },
    {
      key: "user",
      label: "Nom",
      render: (item: Record<string, unknown>) => {
        const u = (item.user as { prenom?: string; nom?: string }) ?? {};
        return `${u.prenom ?? ""} ${u.nom ?? ""}`.trim();
      },
    },
    { key: "classe", label: "Classe" },
  ],
  list: listEleves,
  create: createEleve,
  update: updateEleve,
  remove: deleteEleve,
  toFormValues: (item: Record<string, unknown>) => {
    const raw = item as Record<string, { id?: string | number } | string | number>;
    return {
      matricule: raw.matricule,
      niveau_id: typeof raw.niveau === "object" ? raw.niveau?.id : undefined,
      classe: raw.classe,
    };
  },
};

export const professeurSchema: ResourceSchema = {
  key: "professeur",
  title: "Professeur",
  fields: [
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "prenom", label: "Prénom", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "password", label: "Mot de passe", type: "text", required: true, helperText: "Généré ou choisi pour le nouveau compte" },
    { name: "specialite", label: "Spécialité", type: "text", placeholder: "Mathématiques" },
  ],
  columns: [
    {
      key: "user",
      label: "Nom",
      render: (item: Record<string, unknown>) => {
        const u = (item.user as { prenom?: string; nom?: string }) ?? {};
        return `${u.prenom ?? ""} ${u.nom ?? ""}`.trim();
      },
    },
    { key: "user_email", label: "Email", render: (item: Record<string, unknown>) => (item.user as { email?: string })?.email },
    { key: "specialite", label: "Spécialité" },
  ],
  list: listProfesseurs,
  create: createProfesseur,
  update: updateProfesseur,
  remove: deleteProfesseur,
  toFormValues: (item: Record<string, unknown>) => ({ specialite: (item as Record<string, string>).specialite }),
};

export const RESOURCE_SCHEMAS: Record<string, ResourceSchema> = {
  matiere: matiereSchema,
  niveau: niveauSchema,
  categorie: categorieSchema,
  exercice: exerciceSchema,
  eleve: eleveSchema,
  professeur: professeurSchema,
};