import Header from "../components/ui/Header";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";
import UseSujet from "../hooks/useSujet";
import SujetCard from "../components/SujetCard";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Filtre from "../components/Filtre";

interface FiltreState {
  matiere: string;
  niveau: string;
}

export default function ListeSujets() {
  const { sujet, loadingSujet, err } = UseSujet();
  const [open, setPanelOpen] = useState(false);
  const [filtre, setFiltre] = useState<FiltreState>({ matiere: "", niveau: "" });

  const handleFiltreChange = (key: keyof FiltreState, value: string) => {
    setFiltre((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFiltre({ matiere: "", niveau: "" });
  };

  const sujetFiltre = sujet.filter((s) => {
    const matiereOk = filtre.matiere === "" || s.matiere.nom === filtre.matiere;
    const niveauOk = filtre.niveau === "" || s.niveau.libelle === filtre.niveau;
    return matiereOk && niveauOk;
  });

  const filtresActifs = filtre.matiere !== "" || filtre.niveau !== "";

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="px-8 pt-4">
        <Header />
      </div>
      <div className="px-8 py-6">
        {/* Entête */}
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Tous les Sujets d'examens
            </h1>
            <p className="text-sm text-gray-400">
              Explorez les sujets populaires
            </p>
          </div>
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium border rounded-full px-4 py-1.5 transition-colors ${
              open
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
          <Filtre
            filtre={filtre}
            onChange={handleFiltreChange}
            onReset={handleReset}
            open={open}
            onClose={() => setPanelOpen(false)}
            loading={loadingSujet}
          />
        </div>

        {/* États */}
        {loadingSujet ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : err ? (
          <p className="text-sm text-red-500 text-center py-16">
            Erreur de chargement rafraîchissez la page
          </p>
        ) : sujet?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Aucun sujet ne correspond à ces filtres.
          </p>
        ) : sujetFiltre.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Aucun exercice ne correspond à ces filtres.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sujetFiltre.map((exercice) => (
                <SujetCard sujet={exercice} key={exercice.id} />
              ))}
            </div>

            {/* Pagination */}
          </>
        )}
      </div>
    </div>
  );
}