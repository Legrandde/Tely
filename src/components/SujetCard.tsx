
import { useNavigate } from "react-router-dom";
import type { SujetInterface } from "../types/Sujet";
import { BookOpen } from "lucide-react";





const TYPE_LABELS: Record<string, string> = {
  classique: "Exercice",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

const GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-indigo-600 to-blue-800",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-green-700",
  "from-violet-600 to-fuchsia-600",
];

// Génère un gradient stable à partir de l'id (pas de champ "gradient" côté API)
function gradientFor(id: number) {
  const index = id % GRADIENTS.length;
  return GRADIENTS[index];
}

interface SujetProps{
  sujet: SujetInterface;
}

export default function SujetCard({sujet}: SujetProps) {
  
  const navigate = useNavigate();

  
  return (
    <div
      onClick={() => navigate(`/ennoncer-sujet?id=${sujet.id}`)}
      className="flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Vignette */}
      <div
        className={`relative h-36 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradientFor(sujet.id)}`}
      >
        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full">
          {sujet.niveau.libelle}
        </span>
        <span className="text-white font-bold text-lg text-center px-4 line-clamp-3">
          {sujet.titre}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-3 gap-1.5">
        <p className="text-xs text-gray-400">En {sujet.annee}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {sujet.matiere.nom} — {sujet.titre}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen size={13} className="text-emerald-500" />
            {TYPE_LABELS[sujet.type] ?? sujet.type}
          </span>
          
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <button className="text-xs font-medium text-orange-600 hover:text-orange-700">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
}