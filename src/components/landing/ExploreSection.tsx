import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReferenceData } from "@/hooks/useReferenceData";
import { resolveImageUrl } from "@/utils/imageUrl";
import SectionTitre from "./SectionTitre";
import { Skeleton } from "@/components/ui/skeleton";

const TEINTES = [
  "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-zinc-900 text-amber-300 dark:bg-zinc-800 dark:text-amber-400",
  "bg-amber-500 text-zinc-950",
  "bg-secondary text-foreground border border-border",
];

/**
 * Exploration par matières (bandeau carrousel épuré avec flèches circulaires gauche/droite
 * et défilement automatique) et par niveaux.
 */
export default function ExploreSection() {
  const { matieres, niveaux, loading } = useReferenceData();
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

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

  const scrollStep = (direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const step = 220;
    if (direction === "next") {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 8) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -step, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (paused || loading || matieres.length === 0) return;
    const timer = window.setInterval(() => {
      scrollStep("next");
    }, 2800);
    return () => window.clearInterval(timer);
  }, [paused, loading, matieres.length]);

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

        {/* Matières — Bandeau carrousel épuré avec titre centré et flèches circulaires latérales */}
        <div className="relative mt-14 py-6">
          <div
            aria-hidden="true"
            className="bg-grid-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          />

          <h3 className="relative text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Par matière
          </h3>

          {loading ? (
            <div
              className="relative mt-8 flex items-center justify-center gap-10 overflow-hidden px-14"
              aria-hidden="true"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5 shrink-0">
                  <Skeleton className="size-16 rounded-2xl" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative mt-8 flex items-center"
            >
              {/* Flèche circulaire gauche */}
              <button
                type="button"
                onClick={() => scrollStep("prev")}
                aria-label="Matières précédentes"
                className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-secondary hover:scale-105 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-4" />
              </button>

              {/* Piste horizontale épurée */}
              <ul
                ref={trackRef}
                className="flex flex-1 flex-nowrap items-center gap-8 sm:gap-12 overflow-x-auto px-6 py-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
              >
                {matieres.map((m, i) => {
                  const imgUrl = resolveImageUrl(m.image_url || m.image);
                  return (
                    <li key={m.id} className="shrink-0 snap-center">
                      <Link
                        to={`/exercices?matiere_id=${encodeURIComponent(m.id)}`}
                        className="group flex w-32 sm:w-36 flex-col items-center gap-2.5 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl p-1"
                      >
                        <div className="flex size-16 sm:size-[4.5rem] items-center justify-center overflow-hidden rounded-2xl transition-transform duration-200 group-hover:scale-105">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={m.nom}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              className={`flex h-full w-full items-center justify-center text-lg font-extrabold tracking-tight ${TEINTES[i % TEINTES.length]}`}
                              aria-hidden="true"
                            >
                              {(m.code || m.nom).slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="line-clamp-2 text-xs sm:text-sm font-semibold text-foreground transition-colors group-hover:text-amber-600">
                          {m.nom}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Flèche circulaire droite */}
              <button
                type="button"
                onClick={() => scrollStep("next")}
                aria-label="Matières suivantes"
                className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-secondary hover:scale-105 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Niveaux */}
        {(loading || cycles.length > 0) && (
          <>
            <h3 className="mt-10 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Par niveau
            </h3>
            {loading ? (
              <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cycles.map(([cycle, liste]) => (
                  <div
                    key={cycle}
                    className="rounded-xl border border-border bg-card p-4 shadow-2xs"
                  >
                    <p className="text-sm font-semibold text-foreground">{cycle}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {liste.map((n) => (
                        <li key={n.id}>
                          <Link
                            to={`/exercices?niveau_id=${encodeURIComponent(n.id)}`}
                            className="inline-flex rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground transition-colors hover:border-amber-400 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
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
