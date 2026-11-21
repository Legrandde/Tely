/** Petits éléments réutilisés par le blog : pastille de catégorie, avatar d'auteur, méta d'article. */
import { Link } from "react-router-dom";
import { CalendarDays, Clock } from "lucide-react";
import type { ArticleCarte, AuteurArticle, CategorieResume } from "../../../types/blog";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { dateHeureLongue, dateLongue, initialesAuteur, libelleLecture, nomAuteur, urlCategorie } from "../utils";

export function CategorieBadge({
  categorie,
  lien = true,
  taille = "sm",
}: {
  categorie: CategorieResume | null | undefined;
  lien?: boolean;
  taille?: "sm" | "md";
}) {
  if (!categorie) return null;
  const classe = `inline-flex items-center font-semibold uppercase tracking-[0.08em] text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 ${
    taille === "md" ? "text-xs" : "text-[11px]"
  }`;
  return lien ? (
    <Link to={urlCategorie(categorie.slug)} className={`${classe} relative z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500`}>
      {categorie.nom}
    </Link>
  ) : (
    <span className={classe}>{categorie.nom}</span>
  );
}

export function AvatarAuteur({ auteur, taille = "h-8 w-8" }: { auteur: AuteurArticle | null | undefined; taille?: string }) {
  const src = resolveImageUrl(auteur?.avatar_url || auteur?.avatar);
  return src ? (
    <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={`${taille} shrink-0 rounded-full object-cover ring-2 ring-white`} />
  ) : (
    <span aria-hidden="true" className={`${taille} flex shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-amber-400 ring-2 ring-white`}>
      {initialesAuteur(auteur)}
    </span>
  );
}

/** Ligne « auteur · date · temps de lecture ». */
export function MetaArticle({
  auteur,
  publieLe,
  tempsLecture,
  libelleDate,
  clair = false,
}: {
  auteur: AuteurArticle | null | undefined;
  publieLe: string | null | undefined;
  tempsLecture: number;
  /** Remplace la date (ex. « Brouillon », « Programmé le … »). */
  libelleDate?: string;
  clair?: boolean;
}) {
  const sec = clair ? "text-gray-300" : "text-gray-500";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span className="flex items-center gap-2">
        <AvatarAuteur auteur={auteur} />
        <span className={`font-semibold ${clair ? "text-white" : "text-gray-900"}`}>{nomAuteur(auteur)}</span>
      </span>
      {(libelleDate || publieLe) && (
        <span className={`inline-flex items-center gap-1.5 ${sec}`}>
          <CalendarDays size={14} aria-hidden="true" />
          {libelleDate ?? <time dateTime={publieLe ?? undefined}>{dateLongue(publieLe)}</time>}
        </span>
      )}
      <span className={`inline-flex items-center gap-1.5 ${sec}`}>
        <Clock size={14} aria-hidden="true" />
        {libelleLecture(tempsLecture)}
      </span>
    </div>
  );
}

/** Statut d'un article : brouillon, programmé (avec la date) ou publié. */
export function BadgeStatut({ article }: { article: Pick<ArticleCarte, "statut" | "est_programme" | "publie_le"> }) {
  if (article.statut === "brouillon") {
    return (
      <span className="tely-chip whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Brouillon
      </span>
    );
  }
  if (article.est_programme) {
    return (
      <span className="tely-chip bg-sky-50 text-sky-700" title={dateHeureLongue(article.publie_le)}>
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Programmé le {dateHeureLongue(article.publie_le)}
      </span>
    );
  }
  return (
    <span className="tely-chip whitespace-nowrap bg-emerald-50 text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Publié
    </span>
  );
}
