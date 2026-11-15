import { Link } from "react-router-dom";
import { Lock, CheckCircle2, Sparkles } from "lucide-react";

interface MurInscriptionProps {
  /** Chemin de retour après inscription / connexion */
  from: string;
  /** "enonce" : sous l'énoncé tronqué ; "corrige" : onglet Corrigé */
  contexte?: "enonce" | "corrige";
}

const AVANTAGES = ["Énoncé complet", "Corrigé détaillé pas à pas", "Favoris & suivi de progression"];

/**
 * Mur d'inscription affiché aux visiteurs non connectés : la suite de l'énoncé
 * (tronqué à 180 caractères par l'API) et le corrigé sont réservés aux inscrits.
 */
export default function MurInscription({ from, contexte = "enonce" }: MurInscriptionProps) {
  const titre =
    contexte === "corrige"
      ? "Le corrigé détaillé vous attend"
      : "Créez votre compte gratuit pour voir l'énoncé complet et le corrigé";

  return (
    <div className="relative">
      {/* Suite fictive floutée : suggère le contenu sans le révéler */}
      {contexte === "enonce" && (
        <div aria-hidden="true" className="relative -mt-1 select-none pointer-events-none">
          <div className="space-y-2.5 blur-[3px] opacity-60 pt-2">
            {["w-full", "w-11/12", "w-full", "w-4/5", "w-10/12", "w-2/3"].map((w, i) => (
              <div key={i} className={`h-3.5 rounded bg-gray-300 ${w}`} />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/70 to-white" />
        </div>
      )}

      <div
        className={`relative rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-5 sm:p-7 text-center shadow-lg shadow-amber-500/5 ${
          contexte === "enonce" ? "-mt-10" : ""
        }`}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-gray-900 text-white flex items-center justify-center mb-3 shadow-lg">
          <Lock size={20} aria-hidden="true" />
        </div>
        <h3 className="tely-title text-lg sm:text-xl max-w-md mx-auto">{titre}</h3>
        <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
          Rejoignez les élèves qui révisent avec Tely : c'est gratuit et ça prend 30 secondes.
        </p>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
          {AVANTAGES.map((a) => (
            <li key={a} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700">
              <CheckCircle2 size={15} className="text-amber-500 shrink-0" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mt-6">
          <Link to="/auth/signup" state={{ from }} className="tely-btn sm:min-w-[220px]">
            <Sparkles size={16} aria-hidden="true" /> Inscription gratuite
          </Link>
          <Link
            to="/auth/login"
            state={{ from, raison: "Connectez-vous pour débloquer l'énoncé complet et son corrigé." }}
            className="tely-btn-outline"
          >
            J'ai déjà un compte
          </Link>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">Gratuit · Sans engagement · Sans carte bancaire</p>
      </div>
    </div>
  );
}
