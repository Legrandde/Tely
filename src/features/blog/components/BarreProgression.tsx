import { useEffect, useState, type RefObject } from "react";

/** Barre de progression de lecture (fixée en haut de l'écran), calculée sur l'élément ciblé. */
export default function BarreProgression({ cible }: { cible: RefObject<HTMLElement | null> }) {
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    let raf = 0;
    const calculer = () => {
      raf = 0;
      const el = cible.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total <= 0 ? (rect.top <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      setProgression(p);
    };
    const planifier = () => {
      if (!raf) raf = requestAnimationFrame(calculer);
    };
    planifier();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier);
    return () => {
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", planifier);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cible]);

  const pct = Math.round(progression * 100);
  return (
    <div
      role="progressbar"
      aria-label="Progression de la lecture"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
    >
      <div className="h-full origin-left bg-amber-500 transition-transform duration-100 ease-out" style={{ transform: `scaleX(${progression})` }} />
    </div>
  );
}
