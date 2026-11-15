import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { formatStat } from "./stats";

interface CompteurProps {
  valeur: number;
  suffixe?: string;
  duree?: number;
  className?: string;
}

/** Compteur animé (une seule fois, à l'apparition) ; valeur finale directe si mouvement réduit. */
export default function Compteur({ valeur, suffixe = "+", duree = 1400, className }: CompteurProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduit = useReducedMotion();
  const [courant, setCourant] = useState(0);

  useEffect(() => {
    if (!visible || reduit) return;
    let raf = 0;
    const debut = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - debut) / duree);
      const ease = 1 - Math.pow(1 - p, 3);
      setCourant(Math.round(valeur * ease));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduit, valeur, duree]);

  const affiche = reduit ? valeur : courant;

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      <span aria-hidden="true">
        {formatStat(affiche)}
        {suffixe}
      </span>
      <span className="sr-only">
        {formatStat(valeur)}
        {suffixe}
      </span>
    </span>
  );
}
