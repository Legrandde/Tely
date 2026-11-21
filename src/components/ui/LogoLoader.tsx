import { cn } from "@/lib/utils";

interface LogoLoaderProps {
  /** Pleine hauteur d'écran (ex. chargement initial) ou bloc centré. */
  pleinEcran?: boolean;
  /** Texte discret sous le logo (masqué si vide). */
  label?: string;
  className?: string;
}

/**
 * Écran de chargement signature Tely :
 * animation fluide de tracé continu sur les deux rubans entrelacés du monogramme « T ».
 */
export default function LogoLoader({
  pleinEcran = false,
  label,
  className,
}: LogoLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center bg-background text-foreground",
        pleinEcran ? "min-h-[75vh]" : "min-h-[50vh]",
        className,
      )}
    >
      <div className="relative flex flex-col items-center gap-3">
        {/* Halo ambre discret */}
        <div
          className="pointer-events-none absolute -inset-6 rounded-full bg-amber-500/15 blur-2xl animate-pulse dark:bg-amber-400/12"
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 64 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-14 w-auto"
          aria-hidden="true"
        >
          {/* Trace fantôme subtile pour ancrer la silhouette */}
          <path
            d="M23.5 22.5H14.5C9.8 22.5 7 19.3 7 15.2C7 11.1 10.2 8 15.2 8H20.5C30 8 36.8 14.8 36.8 24.5V40.5C36.8 45.8 34.4 49 32 49"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40.5 22.5H49.5C54.2 22.5 57 19.3 57 15.2C57 11.1 53.8 8 48.8 8H43.5C34 8 27.2 14.8 27.2 24.5V40.5C27.2 45.8 29.6 49 32 49"
            stroke="#F59E0B"
            strokeOpacity="0.16"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ruban gauche animé (encre / foreground) */}
          <path
            pathLength={100}
            d="M23.5 22.5H14.5C9.8 22.5 7 19.3 7 15.2C7 11.1 10.2 8 15.2 8H20.5C30 8 36.8 14.8 36.8 24.5V40.5C36.8 45.8 34.4 49 32 49"
            stroke="currentColor"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="tely-ribbon-a"
          />

          {/* Ruban droit animé (ambre) */}
          <path
            pathLength={100}
            d="M40.5 22.5H49.5C54.2 22.5 57 19.3 57 15.2C57 11.1 53.8 8 48.8 8H43.5C34 8 27.2 14.8 27.2 24.5V40.5C27.2 45.8 29.6 49 32 49"
            stroke="#F59E0B"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="tely-ribbon-b"
          />
        </svg>

        <span className="relative tely-title text-lg font-extrabold tracking-[-0.03em] text-foreground/85 animate-pulse">
          tely
        </span>

        {label ? (
          <span className="relative text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>

      <span className="sr-only">Chargement…</span>
    </div>
  );
}
