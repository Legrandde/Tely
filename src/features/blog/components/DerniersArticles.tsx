import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionTitre from "../../../components/landing/SectionTitre";
import { listArticles } from "../../../services/blogService";
import type { ArticleCarte } from "../../../types/blog";
import ArticleCard, { ArticleCardSkeleton } from "./ArticleCard";

type Etat = { statut: "chargement" } | { statut: "ok"; articles: ArticleCarte[] } | { statut: "erreur" };

/** Section « Derniers articles du blog » de la landing. Masquée si erreur ou aucun article. */
export default function DerniersArticles() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  useEffect(() => {
    const controleur = new AbortController();
    listArticles({ per_page: 3 }, controleur.signal)
      .then(({ articles }) => setEtat({ statut: "ok", articles: (articles?.data ?? []).slice(0, 3) }))
      .catch(() => {
        if (!controleur.signal.aborted) setEtat({ statut: "erreur" });
      });
    return () => controleur.abort();
  }, []);

  if (etat.statut === "erreur" || (etat.statut === "ok" && etat.articles.length === 0)) return null;

  return (
    <section aria-labelledby="blog-titre" className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitre
            id="blog-titre"
            centre={false}
            surtitre="Le blog"
            titre="Derniers articles du blog"
            sousTitre="Méthodes de révision, conseils d'examen et actualités pour progresser plus vite."
          />
          <Link
            to="/blog"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-gray-900 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            Voir tous les articles <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {etat.statut === "chargement"
            ? Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            : etat.articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </div>
    </section>
  );
}
