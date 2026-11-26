import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import ExerciceCardSkeleton from "../components/ExerciceCardSkeleton";
import UseSujet from "../hooks/useSujet";
import SujetCard from "../components/SujetCard";
import ModernFilterBar, { type FilterValues } from "../components/ModernFilterBar";
import { useSeo } from "../hooks/useSeo";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const CLES_FILTRES: (keyof FilterValues)[] = ["q", "cycle", "niveau_id", "matiere_id", "serie", "tri"];

/** Filtres lus depuis l'URL (liens profonds `/sujets?matiere_id=…`, partage, retour arrière). */
function lireFiltres(params: URLSearchParams): FilterValues {
  const v: FilterValues = { tri: "pertinence" };
  for (const cle of CLES_FILTRES) {
    const valeur = params.get(cle)?.trim();
    if (valeur) v[cle] = valeur;
  }
  return v;
}

function ecrireFiltres(v: FilterValues): URLSearchParams {
  const p = new URLSearchParams();
  for (const cle of CLES_FILTRES) {
    const valeur = v[cle];
    if (!valeur || (cle === "tri" && valeur === "pertinence")) continue;
    p.set(cle, valeur);
  }
  return p;
}

export default function ListeSujets() {
  const { sujet, loadingSujet, err } = UseSujet();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = useMemo(() => lireFiltres(searchParams), [searchParams]);
  const setFilterValues = (v: FilterValues) => setSearchParams(ecrireFiltres(v), { replace: true });

  useSeo({
    title: "Anciens sujets d'examen corrigés (Brevet, BAC)",
    description:
      "Retrouvez les anciens sujets d'examen et de compositions, classés par matière et par niveau, avec leurs corrigés détaillés pour vous préparer efficacement.",
  });

  const sujetFiltre = useMemo(() => {
    return (sujet || []).filter((s) => {
      // 1. Recherche texte (titre, énoncé, matière, niveau)
      if (filterValues.q && filterValues.q.trim()) {
        const query = filterValues.q.toLowerCase();
        const matchTitle = s.titre?.toLowerCase().includes(query);
        const matchMatiere = s.matiere?.nom?.toLowerCase().includes(query);
        const matchNiveau = s.niveau?.libelle?.toLowerCase().includes(query);
        const matchEnonce = s.ennonce?.toLowerCase().includes(query);
        if (!matchTitle && !matchMatiere && !matchNiveau && !matchEnonce) {
          return false;
        }
      }

      // 2. Cycle
      if (filterValues.cycle && s.niveau?.cycle) {
        if (s.niveau.cycle.toLowerCase() !== filterValues.cycle.toLowerCase()) {
          return false;
        }
      }

      // 3. Niveau
      if (filterValues.niveau_id && s.niveau?.id) {
        if (String(s.niveau.id) !== String(filterValues.niveau_id)) {
          return false;
        }
      }

      // 4. Matière
      if (filterValues.matiere_id && s.matiere?.id) {
        if (String(s.matiere.id) !== String(filterValues.matiere_id)) {
          return false;
        }
      }

      // 5. Série
      if (filterValues.serie) {
        const serieText = filterValues.serie.toLowerCase();
        const matchSerie =
          s.titre?.toLowerCase().includes(serieText) ||
          s.niveau?.libelle?.toLowerCase().includes(serieText);
        if (!matchSerie) {
          return false;
        }
      }

      return true;
    });
  }, [sujet, filterValues]);

  return (
    <div className="tely-page relative flex min-h-screen flex-col">
      <Header />
      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8">
        {/* Entête */}
        <div className="mb-6">
          <h1 className="tely-title text-2xl sm:text-3xl">Tous les sujets d'examen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Retrouvez les annales officielles des examens d'État (BAC, BEPC, CEE) et compositions
          </p>
        </div>

        {/* ── NOUVELLE BARRE DE FILTRE MODERNE (conforme à la maquette) ── */}
        <ModernFilterBar
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({ tri: "pertinence" })}
          placeholder="Chercher un sujet d'examen, une épreuve..."
        />

        {/* États & Grille */}
        {loadingSujet ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciceCardSkeleton key={i} />
            ))}
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center" role="alert">
            <p className="mb-3 text-sm text-destructive">Impossible de charger les sujets d'examen.</p>
            <button type="button" onClick={() => window.location.reload()} className="tely-btn-outline">
              Réessayer
            </button>
          </div>
        ) : sujetFiltre.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
            <p className="text-base font-medium text-foreground mb-1">
              Aucun sujet d'examen ne correspond à ces critères
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Essayez de réinitialiser vos critères de recherche pour afficher tous les sujets disponibles.
            </p>
            <button
              type="button"
              onClick={() => setFilterValues({ tri: "pertinence" })}
              className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sujetFiltre.map((s) => (
              <SujetCard key={s.id} sujet={s} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
