import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useReferenceData } from "../../hooks/useReferenceData";
import SectionTitre from "./SectionTitre";

const TEINTES = [
  "bg-amber-100 text-amber-800",
  "bg-gray-900 text-amber-300",
  "bg-amber-500 text-gray-900",
  "bg-white text-gray-900 ring-1 ring-gray-200",
];

/** Exploration par matières et par niveaux (liens vers /exercices filtrés). */
export default function ExploreSection() {
  const { matieres, niveaux, loading } = useReferenceData();

  const cycles = useMemo(() => {
    const groupes = new Map<string, typeof niveaux>();
    [...niveaux]
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .forEach((n) => {
        const cle = n.cycle?.trim() || "Autres niveaux";
        groupes.set(cle, [...(groupes.get(cle) ?? []), n]);
      });
    return Array.from(groupes.entries());
  }, [niveaux]);

  if (!loading && matieres.length === 0 && niveaux.length === 0) return null;

  return (
    <section aria-labelledby="explorer-titre" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitre
          id="explorer-titre"
          surtitre="Explorer"
          titre="Trouvez vos exercices en un clic"
          sousTitre="Choisissez une matière ou votre niveau : nous vous montrons directement les exercices correspondants."
        />

        {/* Matières */}
        <h3 className="mt-12 text-sm font-semibold uppercase tracking-wider text-gray-500">Par matière</h3>
        {loading ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-amber-100/70" />
            ))}
          </ul>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {matieres.slice(0, 12).map((m, i) => (
              <li key={m.id}>
                <Link
                  to={`/exercices?matiere_id=${encodeURIComponent(m.id)}`}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-amber-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-safe:hover:-translate-y-0.5"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold ${TEINTES[i % TEINTES.length]}`}
                    aria-hidden="true"
                  >
                    {(m.code || m.nom).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{m.nom}</span>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-gray-300 transition-colors group-hover:text-amber-600"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Niveaux */}
        {(loading || cycles.length > 0) && (
          <>
            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-500">Par niveau</h3>
            {loading ? (
              <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="h-9 w-24 animate-pulse rounded-full bg-amber-100/70" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cycles.map(([cycle, liste]) => (
                  <div key={cycle} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-bold text-gray-900">{cycle}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {liste.map((n) => (
                        <li key={n.id}>
                          <Link
                            to={`/exercices?niveau_id=${encodeURIComponent(n.id)}`}
                            className="inline-flex rounded-full border border-gray-200 bg-amber-50/60 px-3.5 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-500"
                          >
                            {n.libelle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
