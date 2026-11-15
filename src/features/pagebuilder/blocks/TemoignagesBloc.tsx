import { Quote } from "lucide-react";
import type { BlocRenduProps, TemoignageItem } from "../types";
import { lien, liste, txt } from "../utils/props";
import { EnteteSection, ImageSure, Reveal, Section } from "./shared";

function initiales(nom: string) {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function TemoignagesBloc({ props }: BlocRenduProps<"temoignages">) {
  const titre = txt(props.titre);
  const elements = liste<TemoignageItem>(props.elements)
    .map((e) => ({ nom: txt(e.nom), role: txt(e.role), texte: txt(e.texte), avatar: lien(e.avatar) }))
    .filter((e) => e.texte);
  if (!titre && elements.length === 0) return null;

  const grille = elements.length === 1 ? "max-w-2xl mx-auto" : elements.length === 2 ? "@3xl:grid-cols-2" : "@3xl:grid-cols-2 @5xl:grid-cols-3";

  return (
    <Section fond="blanc">
      <EnteteSection titre={titre} />
      {elements.length > 0 && (
        <ul className={`grid gap-5 ${grille}`}>
          {elements.map((e, i) => (
            <Reveal as="li" key={i} delay={Math.min(i, 5) * 0.07}>
              <figure className="flex h-full flex-col rounded-2xl bg-amber-50/70 p-6 ring-1 ring-amber-200/50 @3xl:p-7">
                <Quote size={28} className="text-amber-500" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed whitespace-pre-line text-gray-700">
                  {e.texte}
                </blockquote>
                {(e.nom || e.role) && (
                  <figcaption className="mt-6 flex items-center gap-3">
                    {e.avatar ? (
                      <ImageSure src={e.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-amber-400"
                      >
                        {initiales(e.nom)}
                      </span>
                    )}
                    <span className="min-w-0">
                      {e.nom && <span className="block truncate text-sm font-bold text-gray-900">{e.nom}</span>}
                      {e.role && <span className="block truncate text-xs text-gray-500">{e.role}</span>}
                    </span>
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
