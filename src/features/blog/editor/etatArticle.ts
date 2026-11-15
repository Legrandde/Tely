/**
 * Document édité par l'éditeur d'article (même historique / mêmes blocs que le page builder)
 * et conversions vers / depuis l'API.
 */
import type { DocAvecBlocs } from "../../pagebuilder/editor/etat";
import { normaliserBlocs } from "../../pagebuilder/editor/etat";
import { lienSur, validerBlocs } from "../../pagebuilder/utils/liens";
import type { ArticleAdmin, DonneesArticle } from "../../../types/blog";
import { isoVersLocal, localVersIso } from "../utils";

export const MAX_BLOCS_ARTICLE = 80;
export const MAX_TAGS = 10;
export const LONGUEUR_TAG_MAX = 40;
export const EXTRAIT_MAX = 400;
export const META_CONSEILLEE = 160;
export const META_MAX = 300;
export const TITRE_MAX = 200;
export const SLUG_MAX = 220;

/** Brouillon / publication immédiate / publication programmée à une date future. */
export type ModePublication = "brouillon" | "maintenant" | "programme";

export interface DocArticle extends DocAvecBlocs {
  titre: string;
  slug: string;
  extrait: string;
  image_couverture: string;
  categorie_blog_id: number | null;
  tags: string[];
  mis_en_avant: boolean;
  meta_description: string;
  publication: ModePublication;
  /** Valeur d'un `<input type="datetime-local">` (heure locale). */
  date_programmee: string;
}

export const DOC_ARTICLE_VIDE: DocArticle = {
  titre: "",
  slug: "",
  extrait: "",
  image_couverture: "",
  categorie_blog_id: null,
  tags: [],
  mis_en_avant: false,
  meta_description: "",
  publication: "brouillon",
  date_programmee: "",
  blocs: [],
};

/** Champs du panneau « Article » (une erreur sur l'un d'eux ouvre ce panneau). */
export const CHAMPS_ARTICLE = [
  "titre",
  "slug",
  "extrait",
  "image_couverture",
  "categorie_blog_id",
  "tags",
  "mis_en_avant",
  "meta_description",
  "statut",
  "publie_le",
  "publication",
] as const;

function dateFuture(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

/** Article visible du public (publié et date de publication atteinte). */
export const estVisible = (a: Pick<ArticleAdmin, "statut" | "publie_le">) => a.statut === "publie" && !!a.publie_le && !dateFuture(a.publie_le);

export function docDepuisArticle(a: ArticleAdmin): DocArticle {
  const futur = dateFuture(a.publie_le);
  const publication: ModePublication = a.statut === "brouillon" ? "brouillon" : futur ? "programme" : "maintenant";
  return {
    titre: a.titre ?? "",
    slug: a.slug ?? "",
    extrait: a.extrait ?? "",
    image_couverture: a.image_couverture ?? "",
    categorie_blog_id: a.categorie_blog_id ?? null,
    tags: Array.isArray(a.tags) ? a.tags.filter((t): t is string => typeof t === "string") : [],
    mis_en_avant: !!a.mis_en_avant,
    meta_description: a.meta_description ?? "",
    publication,
    date_programmee: futur ? isoVersLocal(a.publie_le) : "",
    blocs: normaliserBlocs(a.blocs),
  };
}

/** Données envoyées au serveur (PUT partiel complet). */
export function donneesDepuisDoc(doc: DocArticle, serveur: Pick<ArticleAdmin, "statut" | "publie_le">): DonneesArticle {
  const base: DonneesArticle = {
    titre: doc.titre.trim(),
    slug: doc.slug,
    extrait: doc.extrait.trim() || null,
    image_couverture: doc.image_couverture.trim() || null,
    meta_description: doc.meta_description.trim() || null,
    categorie_blog_id: doc.categorie_blog_id,
    tags: doc.tags,
    mis_en_avant: doc.mis_en_avant,
    blocs: doc.blocs,
  };
  if (doc.publication === "brouillon") return { ...base, statut: "brouillon" };
  if (doc.publication === "programme") return { ...base, statut: "publie", publie_le: localVersIso(doc.date_programmee) };
  // Publication immédiate : on conserve la date d'un article déjà en ligne.
  return estVisible(serveur) ? { ...base, statut: "publie" } : { ...base, statut: "publie", publie_le: new Date().toISOString() };
}

export function erreurSlugArticle(slug: string): string | null {
  if (!slug) return "L'adresse est obligatoire.";
  if (slug.length > SLUG_MAX) return `L'adresse ne doit pas dépasser ${SLUG_MAX} caractères.`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "L'adresse ne peut contenir que des lettres minuscules, chiffres et tirets.";
  return null;
}

/** Validation côté client (miroir de `SaveArticleRequest`). */
export function validerArticle(doc: DocArticle): Record<string, string[]> {
  const e: Record<string, string[]> = { ...validerBlocs(doc.blocs, MAX_BLOCS_ARTICLE, "Un article") };
  if (!doc.titre.trim()) e.titre = ["Le titre est obligatoire."];
  else if ([...doc.titre].length > TITRE_MAX) e.titre = [`Le titre ne doit pas dépasser ${TITRE_MAX} caractères.`];
  const es = erreurSlugArticle(doc.slug);
  if (es) e.slug = [es];
  if ([...doc.extrait].length > EXTRAIT_MAX) e.extrait = [`L'extrait ne doit pas dépasser ${EXTRAIT_MAX} caractères.`];
  if ([...doc.meta_description].length > META_MAX) e.meta_description = [`La description ne doit pas dépasser ${META_MAX} caractères.`];
  if (doc.image_couverture && !lienSur(doc.image_couverture)) e.image_couverture = ["Le lien de l'image n'est pas autorisé."];
  if (doc.tags.length > MAX_TAGS) e.tags = [`${MAX_TAGS} mots-clés au maximum.`];
  if (doc.publication === "programme") {
    const iso = localVersIso(doc.date_programmee);
    if (!iso) e.publie_le = ["Choisissez la date et l'heure de publication."];
    else if (new Date(iso).getTime() <= Date.now()) e.publie_le = ["La date de programmation doit être dans le futur."];
  }
  return e;
}

/** Regroupe les erreurs `tags.3` sous `tags` (affichage dans le panneau). */
export function normaliserErreurs(errs: Record<string, string[]>): Record<string, string[]> {
  const r: Record<string, string[]> = {};
  for (const [cle, msgs] of Object.entries(errs)) {
    const k = /^tags\.\d+$/.test(cle) ? "tags" : cle;
    r[k] = [...(r[k] ?? []), ...msgs];
  }
  return r;
}
