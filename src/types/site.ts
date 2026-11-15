/** Paramètres publics du site (`GET /api/site/parametres`) — valeurs toujours des chaînes. */
export interface ParametresPublics {
  site_nom: string;
  site_description: string;
  contact_email: string;
  contact_telephone: string;
  mode_maintenance: "0" | "1" | string;
  message_maintenance: string;
  annonce_active: "0" | "1" | string;
  annonce_texte: string;
  annonce_lien: string;
  annonce_lien_texte: string;
  annonce_style: "info" | "promo" | "alerte" | string;
  reseau_facebook: string;
  reseau_instagram: string;
  reseau_linkedin: string;
  reseau_youtube: string;
  reseau_tiktok: string;
  reseau_whatsapp: string;
  inscriptions_ouvertes: "0" | "1" | string;
  candidatures_ouvertes: "0" | "1" | string;
  [key: string]: string;
}

/** Statistiques publiques (`GET /api/site/stats`). */
export interface StatsPubliques {
  exercices: number;
  sujets: number;
  corrections: number;
  matieres: number;
  niveaux: number;
  professeurs: number;
  eleves: number;
}

export interface LienNavigation {
  titre: string;
  slug: string;
}

/** Navigation CMS (`GET /api/site/navigation`). */
export interface NavigationSite {
  menu: LienNavigation[];
  footer: LienNavigation[];
}

/**
 * Page CMS publique minimale (`GET /api/site/accueil`).
 * Les blocs sont typés par l'agent Page builder (`src/features/pagebuilder/types.ts`).
 */
export interface PagePublique {
  id: number;
  titre: string;
  slug: string;
  meta_description?: string | null;
  image_og?: string | null;
  blocs: unknown[];
  [key: string]: unknown;
}

export interface SiteContextValue {
  parametres: ParametresPublics | null;
  navigation: NavigationSite;
  stats: StatsPubliques | null;
  loading: boolean;
}
