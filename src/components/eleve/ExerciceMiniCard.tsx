import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import type { ExerciceCarte } from "../../types/eleve";
import { resolveImageUrl } from "../../utils/imageUrl";
import FavoriButton from "./FavoriButton";

const TYPE_LABELS: Record<string, string> = {
  classique: "Exercice",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

const DIFFICULTE: Record<string, { label: string; classe: string }> = {
  facile: { label: "Facile", classe: "text-emerald-600" },
  moyen: { label: "Moyen", classe: "text-amber-600" },
  difficile: { label: "Difficile", classe: "text-red-600" },
};

const GRADIENTS = [
  "from-amber-400 to-amber-600",
  "from-gray-800 to-gray-950",
  "from-amber-500 to-amber-700",
  "from-gray-700 to-gray-900",
  "from-amber-600 to-amber-800",
];

interface ExerciceMiniCardProps {
  exercice: ExerciceCarte;
  /** Ligne d'information complémentaire (ex. « Corrigé vu · hier ») */
  meta?: ReactNode;
  onFavoriChange?: (favori: boolean) => void;
}

/** Carte compacte d'exercice pour l'espace élève (tableau de bord, favoris). */
export default function ExerciceMiniCard({ exercice, meta, onFavoriChange }: ExerciceMiniCardProps) {
  const image = resolveImageUrl(exercice.image_url || exercice.image);
  const diff = DIFFICULTE[exercice.difficulte];

  return (
    <article className="relative flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group min-w-0">
      <Link
        to={`/ennoncer?id=${exercice.id}`}
        className="flex flex-col flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded-lg"
      >
        <div
          className={`relative h-24 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${
            GRADIENTS[exercice.id % GRADIENTS.length]
          }`}
        >
          {image ? (
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          ) : (
            <BookOpen size={28} className="text-white/70" aria-hidden="true" />
          )}
          {exercice.niveau?.libelle && (
            <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full">
              {exercice.niveau.libelle}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 p-3 flex-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide truncate">
            {exercice.matiere?.nom ?? "Exercice"}
          </span>
          <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
            {exercice.titre}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-1.5 flex-wrap">
            <span>{TYPE_LABELS[exercice.type] ?? exercice.type}</span>
            {diff && (
              <>
                <span aria-hidden="true">·</span>
                <span className={`font-semibold ${diff.classe}`}>{diff.label}</span>
              </>
            )}
          </div>
          {meta && <div className="text-[11px] text-gray-400 pt-1">{meta}</div>}
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <FavoriButton exerciceId={exercice.id} titre={exercice.titre} onChange={onFavoriChange} />
      </div>
    </article>
  );
}

export function ExerciceMiniCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-24 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-3.5 w-full bg-gray-200 rounded" />
        <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
