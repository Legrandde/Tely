import type { ReactNode } from "react";

interface SectionTitreProps {
  id: string;
  surtitre?: string;
  titre: ReactNode;
  sousTitre?: ReactNode;
  centre?: boolean;
  sombre?: boolean;
}

/** En-tête de section homogène (surtitre ambre, titre Bricolage, sous-titre). */
export default function SectionTitre({ id, surtitre, titre, sousTitre, centre = true, sombre = false }: SectionTitreProps) {
  return (
    <div className={`max-w-2xl ${centre ? "mx-auto text-center" : ""}`}>
      {surtitre && (
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${sombre ? "text-amber-300" : "text-amber-600"}`}>
          {surtitre}
        </p>
      )}
      <h2
        id={id}
        className={`mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl ${sombre ? "text-white" : "text-gray-900"}`}
      >
        {titre}
      </h2>
      {sousTitre && (
        <p className={`mt-3 text-base leading-relaxed sm:text-lg ${sombre ? "text-gray-300" : "text-gray-600"}`}>
          {sousTitre}
        </p>
      )}
    </div>
  );
}
