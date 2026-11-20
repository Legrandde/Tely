import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import type { ArticleCarte } from "@/types/blog";
import { resolveImageUrl } from "@/utils/imageUrl";
import { dateRelative, libelleLecture, nomAuteur, urlArticle } from "../utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Visuel de couverture pleine hauteur (ou fond sombre raffiné si l'article n'a pas d'image). */
export function Couverture({
  src,
  className = "",
  eager = false,
}: {
  src: string | null | undefined;
  className?: string;
  eager?: boolean;
}) {
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
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 ${className}`}
    >
      <div className="bg-grid-pattern-dark absolute inset-0 opacity-60" />
      <Newspaper className="relative size-10 text-zinc-600" />
    </div>
  );
}

/**
 * Carte d'article pleine image (style éditorial portrait avec texte superposé en bas
 * sur dégradé sombre : Titre, Sous-titre catégorie/date, puis extrait).
 */
export default function ArticleCard({
  article,
  titreNiveau = "h3",
}: {
  article: ArticleCarte;
  titreNiveau?: "h2" | "h3";
}) {
  const Titre = titreNiveau;
  const sousTitreParts = [
    article.categorie?.nom || nomAuteur(article.auteur),
    article.publie_le ? dateRelative(article.publie_le) : libelleLecture(article.temps_lecture),
  ].filter(Boolean);

  return (
    <article className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-xs transition-all duration-300 focus-within:ring-2 focus-within:ring-ring hover:shadow-xl">
      {/* Image plein cadre */}
      <div className="absolute inset-0">
        <Couverture
          src={article.image_couverture}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {/* Dégradé sombre en bas pour lisibilité optimale du texte blanc */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />

      {/* Contenu superposé en bas à gauche */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-left text-white">
        <Titre className="text-lg sm:text-xl font-medium leading-snug tracking-tight text-white">
          <Link
            to={urlArticle(article.slug)}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {article.titre}
          </Link>
        </Titre>

        {sousTitreParts.length > 0 && (
          <p className="mt-0.5 text-sm font-normal text-white/85">
            {sousTitreParts.join(", ")}
          </p>
        )}

        {article.extrait && (
          <p className="mt-3 line-clamp-3 text-xs sm:text-sm font-light leading-relaxed text-white/85">
            {article.extrait}
          </p>
        )}
      </div>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted"
      aria-hidden="true"
    >
      <Skeleton className="h-full w-full rounded-none" />
      <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-6">
        <Skeleton className="h-5 w-3/4 bg-foreground/15" />
        <Skeleton className="h-3.5 w-1/2 bg-foreground/10" />
        <div className="space-y-1.5 pt-2">
          <Skeleton className="h-3 w-full bg-foreground/10" />
          <Skeleton className="h-3 w-5/6 bg-foreground/10" />
          <Skeleton className="h-3 w-2/3 bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
