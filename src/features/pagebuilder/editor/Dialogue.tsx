import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** Fenêtre modale accessible (Échap, focus initial, clic extérieur), largeur configurable. */
export default function Dialogue({
  ouvert,
  onFermer,
  titre,
  sousTitre,
  children,
  pied,
  largeur = "max-w-3xl",
}: {
  ouvert: boolean;
  onFermer: () => void;
  titre: string;
  sousTitre?: string;
  children: ReactNode;
  pied?: ReactNode;
  largeur?: string;
}) {
  const idTitre = useId();
  const ref = useRef<HTMLDivElement>(null);
  const fermerRef = useRef(onFermer);

  useEffect(() => {
    fermerRef.current = onFermer;
  }, [onFermer]);

  useEffect(() => {
    if (!ouvert) return;
    const precedent = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fermerRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => {
      const cible = ref.current?.querySelector<HTMLElement>("[data-autofocus], input, button:not([data-fermer])");
      cible?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      precedent?.focus?.();
    };
  }, [ouvert]);

  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFermer();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        className={`tely-card tely-animate flex max-h-[92vh] w-full flex-col overflow-hidden rounded-b-none sm:rounded-2xl ${largeur}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={idTitre} className="tely-title text-lg">
              {titre}
            </h2>
            {sousTitre && <p className="tely-subtitle mt-0.5">{sousTitre}</p>}
          </div>
          <button type="button" data-fermer onClick={onFermer} className="tely-icon-btn shrink-0" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {pied && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3 sm:px-6">{pied}</div>}
      </div>
    </div>
  );
}
