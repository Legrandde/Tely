/**
 * Types partagés du page builder (CMS visuel).
 * Exportés pour les autres modules : `Bloc`, `TypeBloc`, `Page`.
 */

export type TypeBloc =
  | "hero"
  | "texte"
  | "image"
  | "texte_image"
  | "fonctionnalites"
  | "statistiques"
  | "etapes"
  | "cta"
  | "faq"
  | "temoignages"
  | "tarifs"
  | "exercices_recents"
  | "logos"
  | "video"
  | "espace";

export interface Bloc {
  id: string;
  type: TypeBloc;
  props: Record<string, unknown>;
  masque?: boolean;
}

export type StatutPage = "brouillon" | "publie";

export interface Page {
  id: number;
  titre: string;
  slug: string;
  meta_description: string | null;
  image_og: string | null;
  blocs: Bloc[];
  statut: StatutPage;
  est_accueil: boolean;
  dans_menu: boolean;
  dans_footer: boolean;
  publie_le: string | null;
  updated_at: string;
  created_at?: string;
}

/** Page publique (le serveur ne renvoie que les champs publics). */
export type PagePublique = Pick<
  Page,
  "id" | "titre" | "slug" | "meta_description" | "image_og" | "blocs" | "est_accueil" | "publie_le" | "updated_at"
>;

export interface PageResume {
  id: number;
  titre: string;
  slug: string;
  statut: StatutPage;
  est_accueil: boolean;
  dans_menu: boolean;
  dans_footer: boolean;
  publie_le: string | null;
  updated_at: string;
  created_at: string;
  modifie_par: { id: number; nom: string; prenom: string } | null;
}

export interface Media {
  id: number;
  nom: string;
  url: string;
  mime: string;
  taille: number;
  alt: string | null;
  created_at: string;
}

export interface Pagination<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface StatsPubliques {
  exercices: number;
  sujets: number;
  corrections: number;
  matieres: number;
  niveaux: number;
  professeurs: number;
  eleves: number;
}

// ─── Props de chaque type de bloc ──────────────────────────────────────────

export type Fond = "creme" | "blanc" | "sombre" | "ambre";

export interface HeroProps {
  titre: string;
  sous_titre: string;
  bouton_texte: string;
  bouton_lien: string;
  bouton2_texte: string;
  bouton2_lien: string;
  image: string;
  alignement: "centre" | "gauche";
  fond: Fond;
}

export interface TexteProps {
  titre: string;
  contenu: string;
  alignement: "gauche" | "centre";
}

export interface ImageProps {
  image: string;
  alt: string;
  legende: string;
  largeur: "normale" | "pleine";
}

export interface TexteImageProps {
  titre: string;
  contenu: string;
  image: string;
  alt: string;
  position_image: "gauche" | "droite";
  bouton_texte: string;
  bouton_lien: string;
}

export interface FonctionnaliteItem {
  icone: string;
  titre: string;
  texte: string;
}
export interface FonctionnalitesProps {
  titre: string;
  sous_titre: string;
  colonnes: 2 | 3 | 4;
  elements: FonctionnaliteItem[];
}

export interface StatItem {
  valeur: string;
  libelle: string;
}
export interface StatistiquesProps {
  titre: string;
  source: "auto" | "manuel";
  elements: StatItem[];
}

export interface EtapeItem {
  titre: string;
  texte: string;
}
export interface EtapesProps {
  titre: string;
  sous_titre: string;
  elements: EtapeItem[];
}

export interface CtaProps {
  titre: string;
  texte: string;
  bouton_texte: string;
  bouton_lien: string;
  fond: "sombre" | "ambre" | "creme";
}

export interface FaqItem {
  question: string;
  reponse: string;
}
export interface FaqProps {
  titre: string;
  elements: FaqItem[];
}

export interface TemoignageItem {
  nom: string;
  role: string;
  texte: string;
  avatar: string;
}
export interface TemoignagesProps {
  titre: string;
  elements: TemoignageItem[];
}

export interface TarifItem {
  nom: string;
  prix: string;
  periode: string;
  description: string;
  points: string[];
  bouton_texte: string;
  bouton_lien: string;
  mis_en_avant: boolean;
}
export interface TarifsProps {
  titre: string;
  sous_titre: string;
  elements: TarifItem[];
}

export interface ExercicesRecentsProps {
  titre: string;
  nombre: number;
  matiere_id: number | null;
  niveau_id: number | null;
  bouton_texte: string;
}

export interface LogoItem {
  nom: string;
  image: string;
  lien: string;
}
export interface LogosProps {
  titre: string;
  elements: LogoItem[];
}

export interface VideoProps {
  titre: string;
  url: string;
}

export interface EspaceProps {
  hauteur: "petit" | "moyen" | "grand";
}

export interface BlocPropsMap {
  hero: HeroProps;
  texte: TexteProps;
  image: ImageProps;
  texte_image: TexteImageProps;
  fonctionnalites: FonctionnalitesProps;
  statistiques: StatistiquesProps;
  etapes: EtapesProps;
  cta: CtaProps;
  faq: FaqProps;
  temoignages: TemoignagesProps;
  tarifs: TarifsProps;
  exercices_recents: ExercicesRecentsProps;
  logos: LogosProps;
  video: VideoProps;
  espace: EspaceProps;
}

/** Props reçues par un composant de rendu : tout peut manquer (données venant de l'API). */
export interface BlocRenduProps<K extends TypeBloc> {
  props: Partial<BlocPropsMap[K]>;
}
