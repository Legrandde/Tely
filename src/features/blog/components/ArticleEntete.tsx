import type { ReactNode } from "react";
import { Newspaper } from "lucide-react";
import type { AuteurArticle, CategorieResume } from "@/types/blog";
import { resolveImageUrl } from "@/utils/imageUrl";
import { dateLongue, dateRelative, libelleLecture, nomAuteur } from "../utils";

/**
 * En-tête éditorial pleine image d'un article, aligné sur le design des cartes
 * (image plein cadre, dégradé sombre en bas, titre + méta + extrait en blanc superposés).
 * Utilisé par la page publique et par l'aperçu de l'éditeur.
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
  /** Contenu placé au-dessus de la carte hero (fil d'Ariane sur la page publique). */
  avant?: ReactNode;
  /** Mode éditeur : textes de remplacement visibles. */
  apercu?: boolean;
  idTitre?: string;
}) {
  const image = resolveImageUrl(couverture);

  const metaParts = [
    categorie?.nom,
    nomAuteur(auteur),
    libelleDate || (publieLe ? dateRelative(publieLe) : null),
    libelleLecture(tempsLecture),
  ].filter(Boolean);

  return (
    <header className="bg-background px-4 pt-8 pb-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {avant}

        <div className="relative flex min-h-[380px] sm:min-h-[480px] w-full flex-col justify-end overflow-hidden rounded-xl bg-zinc-900 shadow-lg">
          {/* Image de couverture plein cadre */}
          <div className="absolute inset-0">
            {image ? (
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            ) : (
              <div
                aria-hidden="true"
                className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950"
              >
                <div className="bg-grid-pattern-dark absolute inset-0 opacity-60" />
                {apercu ? (
                  <span className="relative text-sm font-medium text-zinc-500">
                    Image de couverture (16:9 conseillé)
                  </span>
                ) : (
                  <Newspaper className="relative size-12 text-zinc-700" />
                )}
              </div>
            )}
          </div>

          {/* Dégradé sombre progressif pour une lecture impeccable */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
          />

          {/* Texte éditorial ancré en bas à gauche */}
          <div className="relative z-10 max-w-3xl p-6 sm:p-10 text-left text-white">
            <h1
              id={idTitre}
              className={`text-2xl sm:text-4xl lg:text-[42px] font-medium leading-[1.12] tracking-tight ${
                titre ? "text-white" : "text-white/40"
              }`}
            >
              {titre || (apercu ? "Titre de l'article" : "")}
            </h1>

            {metaParts.length > 0 && (
              <p
                className="mt-2 text-sm sm:text-base font-normal text-white/85"
                title={publieLe ? dateLongue(publieLe) : undefined}
              >
                {metaParts.join(" · ")}
              </p>
            )}

            {(extrait || apercu) && (
              <p
                className={`mt-4 max-w-2xl text-sm sm:text-base font-light leading-relaxed ${
                  extrait ? "text-white/85" : "italic text-white/40"
                }`}
              >
                {extrait || "Ajoutez un extrait accrocheur dans l'onglet « Article »."}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
