import type { ReactNode } from "react";
import type { AuteurArticle, CategorieResume } from "../../../types/blog";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { CategorieBadge, MetaArticle } from "./Elements";

/**
 * En-tête d'un article (catégorie, titre h1, extrait, auteur, date, temps de lecture, couverture).
 * Utilisé tel quel par la page publique et par le canevas de l'éditeur, pour un aperçu fidèle.
 */
export default function ArticleEntete({
  titre,
  extrait,
  categorie,
  auteur,
  publieLe,
  tempsLecture,
  couverture,
  libelleDate,
  avant,
  apercu = false,
  idTitre,
}: {
  titre: string;
  extrait?: string | null;
  categorie: CategorieResume | null | undefined;
  auteur: AuteurArticle | null | undefined;
  publieLe: string | null | undefined;
  tempsLecture: number;
  couverture?: string | null;
  libelleDate?: string;
  /** Contenu placé au-dessus de la catégorie (fil d'Ariane sur la page publique). */
  avant?: ReactNode;
  /** Mode éditeur : liens désactivés, textes de remplacement visibles. */
  apercu?: boolean;
  idTitre?: string;
}) {
  const image = resolveImageUrl(couverture);
  return (
    <header className="bg-white">
      <div className="relative overflow-hidden bg-amber-50 px-4 pb-24 pt-10 @3xl:px-8 @3xl:pb-32 @3xl:pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl">
          {avant}
          {categorie && (
            <div className="mb-4">
              <CategorieBadge categorie={categorie} lien={!apercu} taille="md" />
            </div>
          )}
          <h1
            id={idTitre}
            className={`text-[30px] font-extrabold leading-[1.12] tracking-[-0.025em] @3xl:text-[46px] ${titre ? "text-gray-900" : "text-gray-300"}`}
          >
            {titre || (apercu ? "Titre de l'article" : "")}
          </h1>
          {(extrait || apercu) && (
            <p className={`mt-4 text-lg leading-relaxed @3xl:text-xl ${extrait ? "text-gray-600" : "italic text-gray-400"}`}>
              {extrait || "Ajoutez un extrait accrocheur dans l'onglet « Article »."}
            </p>
          )}
          <div className="mt-6">
            <MetaArticle auteur={auteur} publieLe={publieLe} tempsLecture={tempsLecture} libelleDate={libelleDate} />
          </div>
        </div>
      </div>
      {(image || apercu) && (
        <div className="relative z-[1] -mt-16 px-4 @3xl:-mt-24 @3xl:px-8">
          <div className="mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl bg-gray-100 shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5">
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" fetchPriority="high" />
            ) : (
              <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400">
                Image de couverture (16:9 conseillé)
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
