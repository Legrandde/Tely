import { SlidersHorizontal, X } from "lucide-react";
import { useReferenceData } from "../hooks/useReferenceData";
import type { Difficulte, ExerciceFilters, ExerciceType } from "../types/exercice";

interface FilterPanelProps {
  filtres: ExerciceFilters;
  onChange: (filtres: ExerciceFilters) => void;
  open: boolean;
  onClose: () => void;
}

const DIFFICULTES: Difficulte[] = ["facile", "moyen", "difficile"];
const TYPES: { value: ExerciceType; label: string }[] = [
  { value: "classique", label: "Exercice classique" },
  { value: "qcm", label: "QCM" },
  { value: "probleme", label: "Problème" },
  { value: "sujet_examen", label: "Sujet d'examen" },
];

export default function FilterPanel({
  filtres,
  onChange,
  open,
  onClose,
}: FilterPanelProps) {
  const { matieres, niveaux, loading } = useReferenceData();

  if (!open) return null;

  const reset = () => onChange({});

  return (
    <div className="absolute right-8 top-16 z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm flex items-center gap-2">
          <SlidersHorizontal size={14} />
          Filtrer les exercices
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-4 text-center">Chargement des filtres...</p>
      ) : (
        <>
          {/* Matière */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Matière
            </label>
            <select
              value={filtres.matiere_id ?? ""}
              onChange={(e) =>
                onChange({ ...filtres, matiere_id: e.target.value || undefined })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Toutes</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Niveau
            </label>
            <select
              value={filtres.niveau_id ?? ""}
              onChange={(e) =>
                onChange({ ...filtres, niveau_id: e.target.value || undefined })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Tous</option>
              {niveaux.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.libelle} ({n.cycle})
                </option>
              ))}
            </select>
          </div>

          {/* Type d'exercice */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Type
            </label>
            <select
              value={filtres.type ?? ""}
              onChange={(e) =>
                onChange({ ...filtres, type: (e.target.value || undefined) as ExerciceType })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Tous</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulté */}
          <div className="mb-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Difficulté
            </label>
            <select
              value={filtres.difficulte ?? ""}
              onChange={(e) =>
                onChange({ ...filtres, difficulte: (e.target.value || undefined) as Difficulte })
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Toutes</option>
              {DIFFICULTES.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <button
        onClick={reset}
        className="w-full mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 text-center"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}