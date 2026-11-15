import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useCtaInscription } from "./useCtaInscription";

/** Appel à l'action final, avant le footer. */
export default function FinalCta() {
  const { isAuthenticated } = useAuth();
  const cta = useCtaInscription("Créer mon compte gratuit");

  return (
    <section aria-labelledby="cta-final-titre" className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-amber-500 px-6 py-14 text-center shadow-xl shadow-amber-500/20 sm:px-12 sm:py-20">
        <div className="bg-grid-pattern-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <h2 id="cta-final-titre" className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
            Votre prochaine bonne note commence aujourd'hui
          </h2>
          <p className="mt-4 text-base text-gray-900/80 sm:text-lg">
            {isAuthenticated
              ? "Continuez sur votre lancée : de nouveaux exercices vous attendent."
              : "Rejoignez les élèves qui révisent avec Tely. Gratuit, simple, efficace."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link to="/exercices" className="tely-btn px-7 py-4 text-base">
                Explorer les exercices <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link to={cta.to} className="tely-btn px-7 py-4 text-base">
                  {cta.label} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-[10px] border border-gray-900/20 bg-white/40 px-7 py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  J'ai déjà un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
