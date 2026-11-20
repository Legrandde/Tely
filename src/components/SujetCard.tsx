import { useNavigate } from "react-router-dom";
import type { SujetInterface } from "@/types/Sujet";
import { BookOpen, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function gradientFor(id: string | number) {
  const numericId = Number(id);
  const index = (Number.isFinite(numericId) ? Math.abs(numericId) : 0) % GRADIENTS.length;
  return GRADIENTS[index];
}

interface SujetProps {
  sujet: SujetInterface;
}

export default function SujetCard({ sujet }: SujetProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Card
      onClick={() => navigate(`/ennoncer-sujet?id=${sujet.id}`)}
      className="p-0 gap-0 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
    >
      {/* Vignette */}
      <div
        className={`relative h-36 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradientFor(sujet.id)}`}
      >
        {sujet.niveau?.libelle && (
          <Badge
            variant="secondary"
            className="absolute top-2.5 right-2.5 bg-background/90 backdrop-blur-xs text-foreground border-0"
          >
            {sujet.niveau.libelle}
          </Badge>
        )}

        <span className="text-white font-bold text-base sm:text-lg text-center px-5 line-clamp-3">
          {sujet.titre}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-4 gap-2 flex-1">
        <p className="text-xs text-muted-foreground">Session {sujet.annee}</p>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-amber-600 transition-colors">
          {sujet.matiere.nom} — {sujet.titre}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5 text-amber-500" />
            {TYPE_LABELS[sujet.type] ?? sujet.type}
          </span>
        </div>

        <div className="flex items-center justify-end mt-auto pt-3 border-t border-border">
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
