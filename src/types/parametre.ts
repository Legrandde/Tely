/** Valeurs booléennes stockées en chaîne par le backend. */
export type Drapeau = "0" | "1";

export type AnnonceStyle = "info" | "promo" | "alerte";

export interface PlatformSettings {
  // Général
  site_nom: string;
  site_description: string;
  contact_email: string;
  contact_telephone: string;

  // Maintenance
  mode_maintenance: string;
  message_maintenance: string;

  // Bannière d'annonce
  annonce_active: string;
  annonce_texte: string;
  annonce_lien: string;
  annonce_lien_texte: string;
  annonce_style: string;

  // Réseaux sociaux
  reseau_facebook: string;
  reseau_instagram: string;
  reseau_linkedin: string;
  reseau_youtube: string;
  reseau_tiktok: string;
  reseau_whatsapp: string;

  // Pédagogie & inscriptions
  inscriptions_ouvertes: string;
  candidatures_ouvertes: string;
  correction_obligatoire: string;
  taille_max_fichier_mo: string;

  // Notifications
  notif_email_candidature: string;
  notif_email_exercice: string;
  alertes_navigateur: string;

  // Sécurité
  longueur_min_mdp: string;
  expiration_session_min: string;

  [key: string]: string;
}

export type ReseauSocialKey =
  | "reseau_facebook"
  | "reseau_instagram"
  | "reseau_linkedin"
  | "reseau_youtube"
  | "reseau_tiktok"
  | "reseau_whatsapp";

export interface SettingsResponse {
  status: string;
  parametres: PlatformSettings;
}
