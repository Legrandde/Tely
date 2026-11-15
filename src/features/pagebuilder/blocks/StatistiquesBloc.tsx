import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import type { BlocRenduProps, StatItem } from "../types";
import { useSiteStats } from "../hooks";
import { choix, liste, txt } from "../utils/props";
import { EnteteSection, Reveal, Section } from "./shared";

const FORMAT = new Intl.NumberFormat("fr-FR");

/** Compteur animé à l'apparition (désactivé si l'utilisateur réduit les animations). */
function Compteur({ valeur }: { valeur: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduire = useReducedMotion();
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    if (!visible || reduire) return;
    const controle = animate(0, valeur, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => controle.stop();
  }, [visible, reduire, valeur]);

  return <span ref={ref}>{FORMAT.format(reduire ? valeur : affiche)}</span>;
}

export default function StatistiquesBloc({ props }: BlocRenduProps<"statistiques">) {
  const titre = txt(props.titre);
  const auto = choix(props.source, ["auto", "manuel"] as const, "auto") === "auto";
  const { stats, chargement, erreur } = useSiteStats(auto);

  const manuels = liste<StatItem>(props.elements)
    .map((e) => ({ valeur: txt(e.valeur), libelle: txt(e.libelle) }))
    .filter((e) => e.valeur || e.libelle);

  const automatiques = stats
    ? [
        { nombre: stats.exercices, libelle: "Exercices disponibles" },
        { nombre: stats.sujets, libelle: "Sujets d'examen" },
        { nombre: stats.corrections, libelle: "Corrigés détaillés" },
        { nombre: stats.eleves, libelle: "Élèves inscrits" },
      ]
    : [];

  if (!auto && manuels.length === 0 && !titre) return null;
  if (auto && erreur && !titre) return null;

  const nb = auto ? 4 : manuels.length;
  const grille = nb >= 4 ? "grid-cols-2 @3xl:grid-cols-4" : nb === 3 ? "grid-cols-1 @xl:grid-cols-3" : "grid-cols-2";

  return (
    <Section fond="sombre" className="relative overflow-hidden">
      <EnteteSection titre={titre} clair />
      <dl className={`grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 ${grille}`}>
        {auto
          ? chargement
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-3 bg-gray-900 p-6 @3xl:p-8">
                  <span className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
                  <span className="h-3.5 w-32 animate-pulse rounded bg-white/5" />
                </div>
              ))
            : erreur
              ? (
                  <div className="col-span-full bg-gray-900 p-6 text-center text-sm text-white/60">
                    Statistiques momentanément indisponibles.
                  </div>
                )
              : automatiques.map((s, i) => (
                  <Reveal key={s.libelle} delay={i * 0.06} className="flex flex-col-reverse gap-2 bg-gray-900 p-6 @3xl:p-8">
                    <dt className="text-sm text-white/60">{s.libelle}</dt>
                    <dd className="text-3xl font-bold tracking-[-0.02em] text-amber-400 @3xl:text-[42px]">
                      <Compteur valeur={s.nombre} />
                      <span className="text-white/40">+</span>
                    </dd>
                  </Reveal>
                ))
          : manuels.map((s, i) => (
              <Reveal key={i} delay={i * 0.06} className="flex flex-col-reverse gap-2 bg-gray-900 p-6 @3xl:p-8">
                {s.libelle && <dt className="text-sm text-white/60">{s.libelle}</dt>}
                {s.valeur && (
                  <dd className="text-3xl font-bold tracking-[-0.02em] text-amber-400 @3xl:text-[42px]">{s.valeur}</dd>
                )}
              </Reveal>
            ))}
      </dl>
    </Section>
  );
}
