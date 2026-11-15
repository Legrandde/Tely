import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import type { BlocRenduProps } from "../types";
import { useExercicesRecents } from "../hooks";
import { entier, idOuNull, txt } from "../utils/props";
import { EnteteSection, ImageSure, Reveal, Section } from "./shared";

const DIFFICULTES: Record<string, { libelle: string; classe: string }> = {
  facile: { libelle: "Facile", classe: "bg-emerald-50 text-emerald-700" },
  moyen: { libelle: "Moyen", classe: "bg-amber-50 text-amber-700" },
  difficile: { libelle: "Difficile", classe: "bg-red-50 text-red-700" },
};

const TYPES: Record<string, string> = {
  classique: "Exercice",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

const DEGRADES = [
  "from-amber-400 to-amber-600",
  "from-gray-800 to-gray-950",
  "from-amber-500 to-orange-600",
  "from-gray-700 to-gray-900",
];

export default function ExercicesRecentsBloc({ props }: BlocRenduProps<"exercices_recents">) {
  const titre = txt(props.titre);
  const bouton = txt(props.bouton_texte);
  const nombre = entier(props.nombre, 1, 12, 6);
  const { exercices, chargement, erreur } = useExercicesRecents(idOuNull(props.matiere_id), idOuNull(props.niveau_id));
  const affiches = (exercices ?? []).slice(0, nombre);

  return (
    <Section fond="blanc">
      <EnteteSection titre={titre} />
      {chargement ? (
        <div className="grid gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3" aria-busy="true" aria-label="Chargement des exercices">
          {Array.from({ length: Math.min(nombre, 6) }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl ring-1 ring-gray-900/5">
              <div className="h-32 animate-pulse bg-gray-100" />
              <div className="space-y-2 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500">
          Les exercices ne peuvent pas être chargés pour le moment.
        </p>
      ) : affiches.length === 0 ? (
        <p className="rounded-2xl bg-amber-50 p-8 text-center text-sm text-gray-600">
          Aucun exercice disponible pour cette sélection pour l'instant.
        </p>
      ) : (
        <ul className="grid gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {affiches.map((ex, i) => {
            const diff = DIFFICULTES[ex.difficulte];
            const image = ex.image_url || ex.image;
            return (
              <Reveal as="li" key={ex.id} delay={Math.min(i, 6) * 0.05}>
                <Link
                  to={`/exercices/${ex.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <div className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ${DEGRADES[ex.id % DEGRADES.length]}`}>
                    {image ? (
                      <ImageSure src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <BookOpen size={34} className="text-white/80" aria-hidden="true" />
                    )}
                    {ex.niveau?.libelle && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">
                        {ex.niveau.libelle}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      {ex.matiere?.nom && <span className="text-amber-700 uppercase tracking-[0.05em]">{ex.matiere.nom}</span>}
                      {TYPES[ex.type] && <span className="text-gray-400">· {TYPES[ex.type]}</span>}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-gray-900">{ex.titre}</h3>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      {diff ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${diff.classe}`}>{diff.libelle}</span>
                      ) : (
                        <span />
                      )}
                      <ArrowRight size={16} className="text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-gray-900" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      )}
      {bouton && (
        <div className="mt-10 text-center">
          <Link
            to="/exercices"
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:-translate-y-px hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {bouton}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </Section>
  );
}
