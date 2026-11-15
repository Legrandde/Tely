import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ExerciceCard from "../ExericiceCard";
import ExerciceCardSkeleton from "../ExerciceCardSkeleton";
import { getExercicesRecents } from "../../services/siteService";
import type { Exercice } from "../../types/exercice";
import SectionTitre from "./SectionTitre";

type Etat = { statut: "chargement" } | { statut: "ok"; exercices: Exercice[] } | { statut: "erreur" };

/** Aperçu des derniers exercices publiés. Masqué si erreur ou aucun exercice. */
export default function RecentExercises() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });

  useEffect(() => {
    let annule = false;
    getExercicesRecents(6)
      .then((exercices) => {
        if (!annule) setEtat({ statut: "ok", exercices });
      })
      .catch(() => {
        if (!annule) setEtat({ statut: "erreur" });
      });
    return () => {
      annule = true;
    };
  }, []);

  if (etat.statut === "erreur" || (etat.statut === "ok" && etat.exercices.length === 0)) return null;

  return (
    <section aria-labelledby="recents-titre" className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitre
            id="recents-titre"
            centre={false}
            surtitre="Nouveautés"
            titre="Derniers exercices ajoutés"
            sousTitre="De nouveaux contenus sont publiés régulièrement par nos enseignants."
          />
          <Link
            to="/exercices?tri=recent"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-gray-900 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            Voir tous les exercices <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {etat.statut === "chargement"
            ? Array.from({ length: 6 }).map((_, i) => <ExerciceCardSkeleton key={i} />)
            : etat.exercices.map((ex) => <ExerciceCard key={ex.id} exercice={ex} />)}
        </div>
      </div>
    </section>
  );
}
