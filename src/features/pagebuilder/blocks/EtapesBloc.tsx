import type { BlocRenduProps, EtapeItem } from "../types";
import { liste, txt } from "../utils/props";
import { EnteteSection, Reveal, Section } from "./shared";

export default function EtapesBloc({ props }: BlocRenduProps<"etapes">) {
  const titre = txt(props.titre);
  const sousTitre = txt(props.sous_titre);
  const elements = liste<EtapeItem>(props.elements).filter((e) => txt(e.titre) || txt(e.texte));
  if (!titre && !sousTitre && elements.length === 0) return null;

  const colonnes = elements.length >= 4 ? "@5xl:grid-cols-4" : elements.length === 3 ? "@3xl:grid-cols-3" : "@3xl:grid-cols-2";

  return (
    <Section fond="blanc">
      <EnteteSection titre={titre} sousTitre={sousTitre} />
      {elements.length > 0 && (
        <ol className={`relative grid gap-8 @2xl:grid-cols-2 ${colonnes}`}>
          {elements.map((el, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className="relative">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-amber-400 shadow-lg shadow-gray-900/20"
                >
                  {i + 1}
                </span>
                {i < elements.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-amber-300 to-transparent @5xl:block" />
                )}
              </div>
              <span className="sr-only">Étape {i + 1} : </span>
              {txt(el.titre) && <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-gray-900">{txt(el.titre)}</h3>}
              {txt(el.texte) && (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-500">{txt(el.texte)}</p>
              )}
            </Reveal>
          ))}
        </ol>
      )}
    </Section>
  );
}
