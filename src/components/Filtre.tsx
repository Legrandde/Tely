import { SlidersHorizontal, X } from "lucide-react";

interface FiltreInterface {
  matiere: string;
  niveau: string;
}

const MATIERES = [
  "Biologie",
  "Mathématique",
  "Physique",
  "Chimie",
  "Economie",
  "français",
  "Anglais",
  "Philosophie",
];

const NIVEAU = ["Terminale SE", "Terminale SM", "Terminale SS",  "BEPC", "CEE"];

interface FiltreProps {
  loading: boolean;
  filtre: FiltreInterface;
  open: boolean;
  onClose: () => void;
  onChange: (key: keyof FiltreInterface, value: string) => void;
  onReset: () => void;
}

export default function Filtre({
  loading,
  open,
  onClose,
  filtre,
  onChange,
  onReset,
}: FiltreProps) {
  if (!open) return null;

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
              value={filtre.matiere}
              onChange={(e) => onChange("matiere", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Toutes</option>
              {MATIERES.map((matiere) => (
                <option key={matiere} value={matiere}>
                  {matiere}
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
              value={filtre.niveau}
              onChange={(e) => onChange("niveau", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Tous</option>
              {NIVEAU.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <button
        onClick={onReset}
        className="w-full mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 text-center"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}