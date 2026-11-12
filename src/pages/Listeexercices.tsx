import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExerciceCard from "../components/ExericiceCard";
import ModernFilterBar from "../components/ModernFilterBar";
import Header from "../components/ui/Header";
import { useExercices } from "../hooks/useExercices";
import type { ExerciceFilters } from "../types/exercice";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";

const FILTRES_INITIAUX: ExerciceFilters = { page: 1, tri: "pertinence" };

export default function ListeExercices() {
  const [filtres, setFiltres] = useState<ExerciceFilters>(FILTRES_INITIAUX);

  const { exercices, totalPages, loading, error } = useExercices(filtres);

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
      <div className="px-4 sm:px-8 pt-4">
        <Header />
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {/* Entête de page */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Tous les exercices
          </h1>
          <p className="text-sm text-gray-500">
            Explorez nos séries d'exercices, annales et résolutions guidées
          </p>
        </div>

        {/* ── NOUVELLE BARRE DE FILTRE MODERNE (conforme à la maquette) ── */}
        <ModernFilterBar
          values={{
            q: filtres.q,
            cycle: filtres.cycle,
            niveau_id: filtres.niveau_id ? String(filtres.niveau_id) : undefined,
            matiere_id: filtres.matiere_id ? String(filtres.matiere_id) : undefined,
            serie: filtres.serie,
            tri: filtres.tri,
          }}
          onChange={(v) =>
            handleFiltresChange({
              ...filtres,
              q: v.q,
              cycle: v.cycle,
              niveau_id: v.niveau_id,
              matiere_id: v.matiere_id,
              serie: v.serie,
              tri: v.tri,
            })
          }
          onReset={() => setFiltres(FILTRES_INITIAUX)}
          placeholder="Chercher un chapitre, une notion..."
        />

        {/* États de chargement et liste des cartes */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-16">{error}</p>
        ) : exercices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-base font-medium text-gray-700 mb-1">
              Aucun exercice ne correspond à ces critères
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Essayez d'ajuster ou d'effacer certains filtres pour élargir la recherche.
            </p>
            <button
              onClick={() => setFiltres(FILTRES_INITIAUX)}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {exercices.map((ex) => (
                <ExerciceCard key={ex.id} exercice={ex} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-amber-500 text-white"
                          : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
