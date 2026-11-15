import { Link } from "react-router-dom";
import { Clock, Newspaper, Star } from "lucide-react";
import type { ArticleCarte } from "../../../types/blog";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { dateLongue, dateRelative, libelleLecture, nomAuteur, urlArticle } from "../utils";
import { AvatarAuteur, CategorieBadge } from "./Elements";

/** Visuel de couverture (ou motif de remplacement si l'article n'en a pas). */
export function Couverture({ src, className = "", eager = false }: { src: string | null | undefined; className?: string; eager?: boolean }) {
  const url = resolveImageUrl(src);
  if (url) {
    return (
      <img
        src={url}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div aria-hidden="true" className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 via-amber-50 to-white ${className}`}>
      <div className="bg-grid-pattern absolute inset-0 opacity-60" />
      <Newspaper size={34} className="relative text-amber-500/70" />
    </div>
  );
}

/** Carte d'article de la grille du blog (toute la carte est cliquable). */
export default function ArticleCard({ article, titreNiveau = "h3" }: { article: ArticleCarte; titreNiveau?: "h2" | "h3" }) {
  const Titre = titreNiveau;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-900/5">
      <div className="aspect-[16/9] overflow-hidden bg-amber-50">
        <Couverture src={article.image_couverture} className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <CategorieBadge categorie={article.categorie} />
          {article.mis_en_avant && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <Star size={12} className="fill-amber-400 text-amber-500" aria-hidden="true" /> À la une
            </span>
          )}
        </div>
        <Titre className="mt-3 text-lg font-bold leading-snug tracking-tight text-gray-900">
          <Link to={urlArticle(article.slug)} className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-gray-700">
            {article.titre}
          </Link>
        </Titre>
        {article.extrait && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{article.extrait}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-gray-500">
          <span className="flex min-w-0 items-center gap-2">
            <AvatarAuteur auteur={article.auteur} taille="h-7 w-7" />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-gray-800">{nomAuteur(article.auteur)}</span>
              <time dateTime={article.publie_le ?? undefined} title={dateLongue(article.publie_le)}>
                {dateRelative(article.publie_le)}
              </time>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock size={13} aria-hidden="true" /> {libelleLecture(article.temps_lecture)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white" aria-hidden="true">
      <div className="aspect-[16/9] animate-pulse bg-gray-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100" />
        <div className="h-5 w-11/12 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="flex items-center gap-2 pt-3">
          <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
