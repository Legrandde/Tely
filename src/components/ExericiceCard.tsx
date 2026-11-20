import { GraduationCap, BookOpen, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Exercice } from "@/types/exercice";
import { useAuth } from "@/context/authContext";
import FavoriButton from "@/components/eleve/FavoriButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciceCardProps {
  exercice: Exercice;
}

const DIFFICULTE_STYLES: Record<string, string> = {
  facile: "text-emerald-600",
  moyen: "text-amber-600",
  difficile: "text-destructive",
};

const TYPE_LABELS: Record<string, string> = {
  classique: "Exercice",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

const GRADIENTS = [
  "from-zinc-900 to-zinc-800",
  "from-amber-500 to-amber-600",
  "from-zinc-800 to-zinc-950",
  "from-amber-600 to-amber-700",
  "from-slate-800 to-zinc-900",
];

function gradientFor(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

export default function ExerciceCard({ exercice }: ExerciceCardProps) {
  const { id, titre, matiere, niveau, difficulte, type, professeur } = exercice;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const auteur = professeur?.user
    ? `${professeur.user.prenom} ${professeur.user.nom}`.trim()
    : "Professeur";

  return (
    <Card
      onClick={() => navigate(`/ennoncer?id=${id}`)}
      className="p-0 gap-0 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
    >
      {/* Vignette */}
      <div
        className={`relative h-36 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradientFor(id)}`}
      >
        <div className="absolute top-2.5 left-2.5 z-10">
          <FavoriButton exerciceId={id} titre={titre} />
        </div>
        {niveau?.libelle && (
          <Badge
            variant="secondary"
            className="absolute top-2.5 right-2.5 bg-background/90 backdrop-blur-xs text-foreground border-0"
          >
            {niveau.libelle}
          </Badge>
        )}
        <span className="text-white font-bold text-base sm:text-lg text-center px-5 line-clamp-3">
          {titre}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-4 gap-2 flex-1">
        <p className="text-xs text-muted-foreground">par {auteur}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-amber-600 transition-colors">
          {matiere?.nom} — {titre}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5 text-amber-500" />
            {TYPE_LABELS[type] ?? type}
          </span>
          {niveau?.cycle && (
            <span className="flex items-center gap-1">
              <GraduationCap className="size-3.5 text-amber-500" />
              {niveau.cycle}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span
            className={`text-xs font-semibold capitalize ${DIFFICULTE_STYLES[difficulte] ?? "text-muted-foreground"}`}
          >
            {difficulte}
          </span>
          <span className="text-xs font-medium text-foreground group-hover:text-amber-600 flex items-center gap-1 transition-colors">
            {!isAuthenticated && <Lock className="size-3 text-amber-500" />}
            Voir détails
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}
