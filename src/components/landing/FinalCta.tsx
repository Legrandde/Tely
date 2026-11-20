import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useCtaInscription } from "./useCtaInscription";
import { Button } from "@/components/ui/button";

/** Appel à l'action final, avant le footer — style SaaS moderne. */
export default function FinalCta() {
  const { isAuthenticated } = useAuth();
  const cta = useCtaInscription("Créer mon compte gratuit");

  return (
    <section aria-labelledby="cta-final-titre" className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-14 text-center shadow-xl sm:px-12 sm:py-20">
        <div className="bg-grid-pattern-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 id="cta-final-titre" className="tely-title text-3xl text-white sm:text-4xl">
            Votre prochaine bonne note commence aujourd'hui
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            {isAuthenticated
              ? "Continuez sur votre lancée : de nouveaux exercices vous attendent."
              : "Rejoignez les élèves qui révisent avec Tely. Gratuit, simple, efficace."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Button asChild variant="brand" size="lg" className="h-12 px-7 text-base">
                <Link to="/exercices">
                  Explorer les exercices <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="brand" size="lg" className="h-12 px-7 text-base">
                  <Link to={cta.to}>
                    {cta.label} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 text-base border-zinc-700 bg-transparent text-white hover:bg-zinc-900 hover:text-white"
                >
                  <Link to="/auth/login">J'ai déjà un compte</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
