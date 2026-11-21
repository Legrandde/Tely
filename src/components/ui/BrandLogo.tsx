import { cn } from "@/lib/utils";

interface TelyMarkProps {
  className?: string;
}

/** Monogramme ruban continu « T » — identité visuelle Tely. */
export function TelyMark({ className }: TelyMarkProps) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-auto shrink-0", className)}
      aria-hidden="true"
    >
      {/* Boucle gauche (encre / foreground) */}
      <path
        d="M23.5 22.5H14.5C9.8 22.5 7 19.3 7 15.2C7 11.1 10.2 8 15.2 8H20.5C30 8 36.8 14.8 36.8 24.5V40.5C36.8 45.8 34.4 49 32 49"
        stroke="currentColor"
        strokeWidth="7.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Boucle droite entrelacée (ambre) */}
      <path
        d="M40.5 22.5H49.5C54.2 22.5 57 19.3 57 15.2C57 11.1 53.8 8 48.8 8H43.5C34 8 27.2 14.8 27.2 24.5V40.5C27.2 45.8 29.6 49 32 49"
        stroke="#F59E0B"
        strokeWidth="7.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Jonction inférieure fluide */}
      <path
        d="M36.8 35V40.5C36.8 45.4 34.7 48.6 32.3 49"
        stroke="currentColor"
        strokeWidth="7.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface BrandLogoProps {
  nom?: string;
  suffixe?: string;
  markClassName?: string;
  textClassName?: string;
  className?: string;
}

/** Logo complet Tely : monogramme ruban « T » + wordmark géométrique. */
export default function BrandLogo({
  nom = "tely",
  suffixe,
  markClassName,
  textClassName,
  className,
}: BrandLogoProps) {
  const label = nom.trim().toLowerCase() === "tely" ? "tely" : nom;
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <TelyMark className={markClassName} />
      <span
        className={cn(
          "tely-title text-[1.35rem] font-extrabold leading-none tracking-[-0.03em]",
          textClassName,
        )}
      >
        {label}
        {suffixe ? (
          <span className="ml-1.5 text-sm font-semibold tracking-normal text-amber-500">
            {suffixe}
          </span>
        ) : null}
      </span>
    </span>
  );
}
