import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExerciceCard from "../components/ExericiceCard";
import ModernFilterBar from "../components/ModernFilterBar";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { useExercices } from "../hooks/useExercices";
import { useSeo } from "../hooks/useSeo";
import type { Difficulte, ExerciceFilters, ExerciceType } from "../types/exercice";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";

const TRI_PAR_DEFAUT = "pertinence";
const TYPES: ExerciceType[] = ["classique", "qcm", "probleme", "sujet_examen"];
const DIFFICULTES: Difficulte[] = ["facile", "moyen", "difficile"];

/** Les filtres vivent dans l'URL : liens partageables, retour arrière, liens profonds depuis la landing. */
function lireFiltres(params: URLSearchParams): ExerciceFilters {
  const f: ExerciceFilters = { page: 1, tri: params.get("tri") || TRI_PAR_DEFAUT };
  const texte = (cle: string) => params.get(cle)?.trim() || undefined;
  f.q = texte("q");
  f.cycle = texte("cycle");
  f.serie = texte("serie");
  const matiere = texte("matiere_id");
  if (matiere && /^\d+$/.test(matiere)) f.matiere_id = matiere;
  const niveau = texte("niveau_id");
  if (niveau && /^\d+$/.test(niveau)) f.niveau_id = niveau;
  const type = texte("type");
  if (type && (TYPES as string[]).includes(type)) f.type = type as ExerciceType;
  const difficulte = texte("difficulte");
  if (difficulte && (DIFFICULTES as string[]).includes(difficulte)) f.difficulte = difficulte as Difficulte;
  if (params.get("avec_correction") === "true") f.avec_correction = true;
  const page = Number(params.get("page"));
  if (Number.isInteger(page) && page > 1) f.page = page;
  // Supprime les clés vides pour une requête API propre
  for (const k of Object.keys(f) as (keyof ExerciceFilters)[]) {
    if (f[k] === undefined) delete f[k];
  }
  return f;
}

function ecrireFiltres(f: ExerciceFilters): URLSearchParams {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([cle, valeur]) => {
    if (valeur === undefined || valeur === null || valeur === "" || valeur === false) return;
    if (cle === "page" && valeur === 1) return;
    if (cle === "tri" && valeur === TRI_PAR_DEFAUT) return;
    p.set(cle, String(valeur));
  });
  return p;
}

export default function ListeExercices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtres = useMemo(() => lireFiltres(searchParams), [searchParams]);

  useSeo({
    title: "Exercices corrigés par matière et par niveau",
    description:
      "Des centaines d'exercices classés par matière, niveau et difficulté, avec corrigés détaillés. Trouvez l'exercice qu'il vous faut et entraînez-vous.",
  });

  const { exercices, totalPages, loading, error } = useExercices(filtres);

  const page = filtres.page ?? 1;

  function handleFiltresChange(nouveauxFiltres: ExerciceFilters) {
    // tout changement de filtre repart de la page 1
    setSearchParams(ecrireFiltres({ ...nouveauxFiltres, page: 1 }), { replace: true });
  }

  function reinitialiser() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    setSearchParams(ecrireFiltres({ ...filtres, page: p }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="tely-page relative flex min-h-screen flex-col">
      <Header />

      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8">
        {/* Entête de page */}
        <div className="mb-6">
          <h1 className="tely-title text-2xl sm:text-3xl">Tous les exercices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Explorez nos séries d'exercices, annales et résolutions guidées
          </p>
        </div>

        <ModernFilterBar
          values={{
            q: filtres.q,
            cycle: filtres.cycle,
            niveau_id: filtres.niveau_id ? String(filtres.niveau_id) : undefined,
            matiere_id: filtres.matiere_id ? String(filtres.matiere_id) : undefined,
            serie: filtres.serie,
            tri: filtres.tri,
          }}
          onChange={(v) =>
            handleFiltresChange({
              ...filtres,
              q: v.q,
              cycle: v.cycle,
              niveau_id: v.niveau_id,
              matiere_id: v.matiere_id,
              serie: v.serie,
              tri: v.tri,
            })
          }
          onReset={reinitialiser}
          placeholder="Chercher un chapitre, une notion..."
        />

        {/* États de chargement et liste des cartes */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center" role="alert">
            <p className="mb-3 text-sm text-red-600">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="tely-btn-outline">
              Réessayer
            </button>
          </div>
        ) : exercices.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 py-16 text-center">
            <p className="mb-1 text-base font-medium text-gray-700">
              Aucun exercice ne correspond à ces critères
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Essayez d'ajuster ou d'effacer certains filtres pour élargir la recherche.
            </p>
            <button
              type="button"
              onClick={reinitialiser}
              className="text-sm font-medium text-amber-700 underline hover:text-amber-800"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {exercices.map((ex) => (
                <ExerciceCard key={ex.id} exercice={ex} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Page précédente"
                  className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => goToPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      aria-label={`Page ${p}`}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-amber-500 text-gray-900"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Page suivante"
                  className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
