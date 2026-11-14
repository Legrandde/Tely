import { GraduationCap, BookOpen, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Exercice } from "../types/exercice";
import { useAuth } from "../context/authContext";

interface ExerciceCardProps {
  exercice: Exercice;
}

const DIFFICULTE_STYLES: Record<string, string> = {
  facile: "text-emerald-600",
  moyen: "text-amber-600",
  difficile: "text-red-600",
};

const TYPE_LABELS: Record<string, string> = {
  classique: "Exercice",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

const GRADIENTS = [
  "from-amber-400 to-amber-600",
  "from-gray-800 to-gray-950",
  "from-amber-500 to-amber-700",
  "from-gray-700 to-gray-900",
  "from-amber-600 to-amber-800",
];

// Génère un gradient stable à partir de l'id (pas de champ "gradient" côté API)
function gradientFor(id: number) {
  const index = id % GRADIENTS.length;
  return GRADIENTS[index];
}

export default function ExerciceCard({ exercice }: ExerciceCardProps) {
  const { id, titre, matiere, niveau, difficulte, type, professeur } = exercice;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const auteur = professeur?.user
    ? `${professeur.user.prenom} ${professeur.user.nom}`.trim()
    : "Professeur";

  return (
    <div
      onClick={() => navigate(`/ennoncer?id=${id}`)}
      className="flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Vignette */}
      <div
        className={`relative h-36 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradientFor(id)}`}
      >
        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full">
          {niveau?.libelle}
        </span>
        <span className="text-white font-bold text-lg text-center px-4 line-clamp-3">
          {titre}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-3 gap-1.5">
        <p className="text-xs text-gray-400">par {auteur}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
          {matiere?.nom} — {titre}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen size={13} className="text-emerald-500" />
            {TYPE_LABELS[type] ?? type}
          </span>
          {niveau?.cycle && (
            <span className="flex items-center gap-1">
              <GraduationCap size={13} className="text-emerald-500" />
              {niveau.cycle}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span
            className={`text-xs font-semibold capitalize ${DIFFICULTE_STYLES[difficulte] ?? "text-gray-600"}`}
          >
            {difficulte}
          </span>
          <button
            type="button"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            {!isAuthenticated && <Lock size={12} className="text-amber-600" />}
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
}
