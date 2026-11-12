import Header from "../components/ui/Header";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";
import UseSujet from "../hooks/useSujet";
import SujetCard from "../components/SujetCard";
import ModernFilterBar, { type FilterValues } from "../components/ModernFilterBar";
import { useState, useMemo } from "react";

export default function ListeSujets() {
  const { sujet, loadingSujet, err } = UseSujet();
  const [filterValues, setFilterValues] = useState<FilterValues>({
    tri: "pertinence",
  });

  const sujetFiltre = useMemo(() => {
    return (sujet || []).filter((s) => {
      // 1. Recherche texte (titre, énoncé, matière, niveau)
      if (filterValues.q && filterValues.q.trim()) {
        const query = filterValues.q.toLowerCase();
        const matchTitle = s.titre?.toLowerCase().includes(query);
        const matchMatiere = s.matiere?.nom?.toLowerCase().includes(query);
        const matchNiveau = s.niveau?.libelle?.toLowerCase().includes(query);
        const matchEnonce = s.ennonce?.toLowerCase().includes(query);
        if (!matchTitle && !matchMatiere && !matchNiveau && !matchEnonce) {
          return false;
        }
      }

      // 2. Cycle
      if (filterValues.cycle && s.niveau?.cycle) {
        if (s.niveau.cycle.toLowerCase() !== filterValues.cycle.toLowerCase()) {
          return false;
        }
      }

      // 3. Niveau
      if (filterValues.niveau_id && s.niveau?.id) {
        if (String(s.niveau.id) !== String(filterValues.niveau_id)) {
          return false;
        }
      }

      // 4. Matière
      if (filterValues.matiere_id && s.matiere?.id) {
        if (String(s.matiere.id) !== String(filterValues.matiere_id)) {
          return false;
        }
      }

      // 5. Série
      if (filterValues.serie) {
        const serieText = filterValues.serie.toLowerCase();
        const matchSerie =
          s.titre?.toLowerCase().includes(serieText) ||
          s.niveau?.libelle?.toLowerCase().includes(serieText);
        if (!matchSerie) {
          return false;
        }
      }

      return true;
    });
  }, [sujet, filterValues]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="px-4 sm:px-8 pt-4">
        <Header />
      </div>
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {/* Entête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Tous les Sujets d'Examens
          </h1>
          <p className="text-sm text-gray-500">
            Retrouvez les annales officielles des examens d'État (BAC, BEPC, CEE) et compositions
          </p>
        </div>

        {/* ── NOUVELLE BARRE DE FILTRE MODERNE (conforme à la maquette) ── */}
        <ModernFilterBar
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({ tri: "pertinence" })}
          placeholder="Chercher un sujet d'examen, une épreuve..."
        />

        {/* États & Grille */}
        {loadingSujet ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : err ? (
          <p className="text-sm text-red-500 text-center py-16">{String(err)}</p>
        ) : sujetFiltre.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-base font-medium text-gray-700 mb-1">
              Aucun sujet d'examen ne correspond à ces critères
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Essayez de réinitialiser vos critères de recherche pour afficher tous les sujets disponibles.
            </p>
            <button
              onClick={() => setFilterValues({ tri: "pertinence" })}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sujetFiltre.map((s) => (
              <SujetCard key={s.id} sujet={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
