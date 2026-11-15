import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../context/authContext";
import { useCtaInscription } from "../../../components/landing/useCtaInscription";

const ATOUTS = ["Exercices corrigés pas à pas", "Anciens sujets du Brevet et du BAC", "100 % gratuit, sans engagement"];

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
      <aside aria-labelledby="cta-blog-bandeau" className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-10 text-white sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Passez de la lecture à la pratique</p>
            <h2 id="cta-blog-bandeau" className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Révisez avec des exercices corrigés et des sujets d'examen
            </h2>
            <p className="mt-2 text-sm text-gray-300 sm:text-base">Nos conseils, c'est bien. Les appliquer sur de vrais sujets d'examen, c'est mieux.</p>
          </div>
          <Link to={cta.to} className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-amber-500 px-6 py-3.5 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
            {cta.label} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-labelledby="cta-blog-fin" className="relative overflow-hidden rounded-3xl bg-amber-500 px-6 py-10 shadow-xl shadow-amber-500/20 sm:px-10">
      <div className="bg-grid-pattern-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-amber-400">
            <BookOpenCheck size={22} aria-hidden="true" />
          </span>
          <h2 id="cta-blog-fin" className="mt-4 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
            Cet article vous a aidé ? Passez à l'entraînement.
          </h2>
          <ul className="mt-4 grid gap-2 text-sm font-medium text-gray-900/85 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {ATOUTS.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" /> {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <Link to={cta.to} className="tely-btn px-6">
            {cta.label} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center rounded-[10px] border border-gray-900/20 bg-white/40 px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            J'ai déjà un compte
          </Link>
        </div>
      </div>
    </aside>
  );
}
