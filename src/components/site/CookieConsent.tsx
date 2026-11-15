import { useEffect, useId, useRef, useState } from "react";
import { Cookie, X } from "lucide-react";
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from "./consent";

interface CookieConsentProps {
  /** Navigation SPA (le bandeau est rendu hors du routeur). */
  onNavigate?: (to: string) => void;
}

/** Bandeau de consentement RGPD : accepter / refuser / personnaliser. */
export default function CookieConsent({ onNavigate }: CookieConsentProps) {
  const [visible, setVisible] = useState(() => getConsent() === null);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(() => getConsent()?.analytics ?? false);
  const titreId = useId();
  const toggleId = useId();
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function ouvrir() {
      setAnalytics(getConsent()?.analytics ?? false);
      setDetails(true);
      setVisible(true);
      // focus sur le bandeau rouvert volontairement
      requestAnimationFrame(() => conteneurRef.current?.focus());
    }
    window.addEventListener(CONSENT_OPEN_EVENT, ouvrir);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, ouvrir);
  }, []);

  if (!visible) return null;

  function choisir(valeur: boolean) {
    setConsent(valeur);
    setAnalytics(valeur);
    setVisible(false);
    setDetails(false);
  }

  function allerConfidentialite(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate("/p/confidentialite");
  }

  return (
    <div
      ref={conteneurRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titreId}
      tabIndex={-1}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl outline-none sm:inset-x-auto sm:left-4 sm:bottom-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 sm:flex">
          <Cookie size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 id={titreId} className="text-sm font-bold text-gray-900">
              Votre vie privée compte
            </h2>
            {details && getConsent() !== null && (
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  setDetails(false);
                }}
                className="tely-icon-btn -m-1 p-1"
                aria-label="Fermer sans modifier"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord,
            une mesure d'audience anonyme pour l'améliorer.{" "}
            <a
              href="/p/confidentialite"
              onClick={allerConfidentialite}
              className="font-semibold text-gray-900 underline underline-offset-2 hover:text-amber-700"
            >
              Politique de confidentialité
            </a>
          </p>

          {details && (
            <fieldset className="mt-3 space-y-2">
              <legend className="sr-only">Catégories de cookies</legend>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-gray-900">Nécessaires</p>
                  <p className="text-[11px] text-gray-500">Connexion, sécurité, préférences. Toujours actifs.</p>
                </div>
                <span className="tely-chip">Toujours actif</span>
              </div>
              <label
                htmlFor={toggleId}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <span>
                  <span className="block text-xs font-semibold text-gray-900">Mesure d'audience</span>
                  <span className="block text-[11px] text-gray-500">Pages vues et parcours, sans publicité.</span>
                </span>
                <input
                  id={toggleId}
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-gray-900"
                />
              </label>
            </fieldset>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {details ? (
              <button
                type="button"
                onClick={() => choisir(analytics)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDetails(true)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Personnaliser
              </button>
            )}
            <button
              type="button"
              onClick={() => choisir(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              Tout refuser
            </button>
            <button
              type="button"
              onClick={() => choisir(true)}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
