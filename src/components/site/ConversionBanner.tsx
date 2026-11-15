import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Lock, X } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSite } from "../../context/SiteContext";

const STORAGE_KEY = "tely:bandeau-conversion-ferme";

function lireFerme(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Bandeau de conversion non intrusif pour les visiteurs (listes d'exercices / de sujets). */
export default function ConversionBanner() {
  const { isAuthenticated, isLoading } = useAuth();
  const { parametres } = useSite();
  const location = useLocation();
  const [ferme, setFerme] = useState(lireFerme);

  if (isLoading || isAuthenticated || ferme) return null;

  const inscriptionsOuvertes = parametres?.inscriptions_ouvertes !== "0";
  const retour = { from: `${location.pathname}${location.search}` };

  function fermer() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setFerme(true);
  }

  return (
    <aside
      aria-label="Créer un compte"
      className="relative mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 via-amber-50 to-white p-4 pr-11 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pr-12"
    >
      <div className="flex items-start gap-3">
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-gray-900 sm:flex">
          <Lock size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900 sm:text-base">
            {inscriptionsOuvertes
              ? "Créez un compte gratuit pour accéder aux énoncés complets et aux corrigés"
              : "Connectez-vous pour accéder aux énoncés complets et aux corrigés"}
          </p>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
            Favoris, historique de vos révisions et corrigés détaillés, sans frais.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {inscriptionsOuvertes && (
          <Link
            to="/auth/signup"
            state={retour}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            Créer un compte gratuit <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
        <Link
          to="/auth/login"
          state={retour}
          className="inline-flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          Se connecter
        </Link>
      </div>
      <button
        type="button"
        onClick={fermer}
        aria-label="Masquer ce message"
        className="absolute right-2 top-2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-900"
      >
        <X size={16} />
      </button>
    </aside>
  );
}
