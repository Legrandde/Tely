export interface PlatformSettings {
  site_nom: string;
  site_description: string;
  contact_email: string;
  mode_maintenance: string;
  inscriptions_ouvertes: string;
  candidatures_ouvertes: string;
  correction_obligatoire: string;
  taille_max_fichier_mo: string;
  notif_email_candidature: string;
  notif_email_exercice: string;
  alertes_navigateur: string;
  longueur_min_mdp: string;
  expiration_session_min: string;
  [key: string]: string;
}

export interface SettingsResponse {
  status: string;
  parametres: PlatformSettings;
}
