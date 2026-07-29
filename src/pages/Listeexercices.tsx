import { useState } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import ExerciceCard from "../components/ExericiceCard";
import FilterPanel from "../components/Filterpanel";
import Header from "../components/ui/Header";
import { useExercices } from "../hooks/useExercices";
import type { ExerciceFilters } from "../types/exercice";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";

const FILTRES_INITIAUX: ExerciceFilters = { page: 1 };

export default function ListeExercices() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [filtres, setFiltres] = useState<ExerciceFilters>(FILTRES_INITIAUX);

  const { exercices, totalPages, loading, error } = useExercices(filtres);

  const filtresActifs =
    !!filtres.matiere_id || !!filtres.niveau_id || !!filtres.difficulte || !!filtres.type;

  const page = filtres.page ?? 1;

  function handleFiltresChange(nouveauxFiltres: ExerciceFilters) {
    // tout changement de filtre repart de la page 1
    setFiltres({ ...nouveauxFiltres, page: 1 });
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    setFiltres({ ...filtres, page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="px-8 pt-4">
        <Header />
      </div>

      <div className="px-8 py-6">
        {/* Entête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Tous les exercices
            </h1>
            <p className="text-sm text-gray-400">
              Explorez nos exercices populaires
            </p>
          </div>

          <button
            onClick={() => setPanelOpen((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium border rounded-full px-4 py-1.5 transition-colors ${
              filtresActifs
                ? "border-orange-300 bg-orange-50 text-orange-600"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtre
            {filtresActifs && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </button>

          <FilterPanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            filtres={filtres}
            onChange={handleFiltresChange}
          />
        </div>

        {/* États */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-16">{error}</p>
        ) : exercices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Aucun exercice ne correspond à ces filtres.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {exercices.map((exercice) => (
                <ExerciceCard key={exercice.id} exercice={exercice} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm text-gray-500 px-2">
                  Page {page} / {totalPages}
                </span>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}