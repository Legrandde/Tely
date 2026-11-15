/**
 * Consentement cookies / traceurs (RGPD).
 * Utilitaire sans React : d'autres modules (analytics…) peuvent appeler
 * `hasAnalyticsConsent()` avant d'envoyer quoi que ce soit, et écouter
 * `CONSENT_CHANGE_EVENT` pour réagir à un changement de choix.
 */

export interface ConsentChoix {
  /** Mesure d'audience. */
  analytics: boolean;
  /** Version du bandeau (permet de redemander si la politique change). */
  version: number;
  /** Date ISO du choix. */
  date: string;
}

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "tely:consentement";

/** Émis sur `window` quand le choix change (detail = ConsentChoix). */
export const CONSENT_CHANGE_EVENT = "tely:consent-change";
/** Émis sur `window` pour rouvrir le bandeau (« Gérer les cookies »). */
export const CONSENT_OPEN_EVENT = "tely:consent-open";

export function getConsent(): ConsentChoix | null {
  try {
    const brut = localStorage.getItem(STORAGE_KEY);
    if (!brut) return null;
    const choix = JSON.parse(brut) as Partial<ConsentChoix>;
    if (typeof choix?.analytics !== "boolean" || choix.version !== CONSENT_VERSION) return null;
    return {
      analytics: choix.analytics,
      version: choix.version,
      date: typeof choix.date === "string" ? choix.date : "",
    };
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): ConsentChoix {
  const choix: ConsentChoix = { analytics, version: CONSENT_VERSION, date: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choix));
  } catch {
    // stockage indisponible : le choix vaut pour la session en cours seulement
  }
  window.dispatchEvent(new CustomEvent<ConsentChoix>(CONSENT_CHANGE_EVENT, { detail: choix }));
  return choix;
}

/** true uniquement si l'utilisateur a explicitement accepté la mesure d'audience. */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

/** Rouvre le bandeau de consentement (lien « Gérer les cookies » du footer). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
