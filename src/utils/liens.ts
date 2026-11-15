/**
 * Validation des liens — source unique, identique à la règle serveur
 * (`app/Http/Requests/Concerns/ValideBlocs.php::lienSur`).
 *
 * Autorisés : http(s) absolu, chemin relatif au site, ancre, `mailto:` et `tel:`.
 * Refusés : tout autre schéma (`javascript:`, `data:`…), les URL « protocol-relative » (`//evil.com`)
 * et toute chaîne contenant un antislash ou un caractère de contrôle — les navigateurs
 * interprètent `/\evil.com` ou `/<TAB>/evil.com` comme `//evil.com`.
 */
// eslint-disable-next-line no-control-regex
const CARACTERES_INTERDITS = /[\u0000-\u001F\u007F\\]/;

export function lienSur(lien: string): boolean {
  const l = lien.trim();
  if (!l || CARACTERES_INTERDITS.test(l)) return false;
  return /^(https?:\/\/[^/]|\/(?!\/)|#|mailto:|tel:)/i.test(l);
}

/** Chemin interne au site (commence par un seul « / »), utilisable pour une redirection. */
export function cheminInterneSur(chemin: string | null | undefined): chemin is string {
  if (!chemin) return false;
  return !CARACTERES_INTERDITS.test(chemin) && /^\/(?![/\\])/.test(chemin);
}
