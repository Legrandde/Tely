import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useCtaInscription } from "@/components/landing/useCtaInscription";
import { Button } from "@/components/ui/button";

const ATOUTS = [
  "Exercices corrigés pas à pas",
  "Anciens sujets du Brevet et du BAC",
  "100 % gratuit, sans engagement",
];

/**
 * Encart de conversion du blog, affiché uniquement aux visiteurs non connectés.
 * `fin` : en fin d'article ; `bandeau` : dans la liste des articles.
 */
export default function CtaBlog({ variante = "fin" }: { variante?: "fin" | "bandeau" }) {
  const { isAuthenticated, isLoading } = useAuth();
  const cta = useCtaInscription("Créer mon compte gratuit");
  if (isLoading || isAuthenticated) return null;

  if (variante === "bandeau") {
    return (
      <aside
        aria-labelledby="cta-blog-bandeau"
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-10 text-white shadow-lg sm:px-10"
      >
        <div className="bg-grid-pattern-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Passez de la lecture à la pratique
            </p>
            <h2 id="cta-blog-bandeau" className="tely-title mt-2 text-2xl text-white sm:text-3xl">
              Révisez avec des exercices corrigés et des sujets d'examen
            </h2>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Nos conseils, c'est bien. Les appliquer sur de vrais sujets d'examen, c'est mieux.
            </p>
          </div>
          <Button asChild variant="brand" size="lg" className="shrink-0">
            <Link to={cta.to}>
              {cta.label} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-labelledby="cta-blog-fin"
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-10 text-white shadow-lg sm:px-10"
    >
      <div className="bg-grid-pattern-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl"
      />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </span>
          <h2 id="cta-blog-fin" className="tely-title mt-4 text-2xl text-white sm:text-3xl">
            Cet article vous a aidé ? Passez à l'entraînement.
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {ATOUTS.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-amber-400" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col">
          <Button asChild variant="brand" size="lg">
            <Link to={cta.to}>
              {cta.label} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-zinc-700 bg-transparent text-white hover:bg-zinc-900 hover:text-white"
          >
            <Link to="/auth/login">J'ai déjà un compte</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
