import { createElement } from "react";
import type { BlocRenduProps, FonctionnaliteItem } from "../types";
import { iconePour } from "../icones";
import { choix, liste, txt } from "../utils/props";
import { EnteteSection, Reveal, Section } from "./shared";

const GRILLES = {
  2: "@2xl:grid-cols-2",
  3: "@2xl:grid-cols-2 @5xl:grid-cols-3",
  4: "@2xl:grid-cols-2 @5xl:grid-cols-4",
} as const;

function Icone({ nom }: { nom: unknown }) {
  return createElement(iconePour(nom), { size: 22, strokeWidth: 2, "aria-hidden": true });
}

export default function FonctionnalitesBloc({ props }: BlocRenduProps<"fonctionnalites">) {
  const titre = txt(props.titre);
  const sousTitre = txt(props.sous_titre);
  const colonnes = choix(props.colonnes, [2, 3, 4] as const, 3);
  const elements = liste<FonctionnaliteItem>(props.elements).filter((e) => txt(e.titre) || txt(e.texte));
  if (!titre && !sousTitre && elements.length === 0) return null;

  return (
    <Section fond="creme">
      <EnteteSection titre={titre} sousTitre={sousTitre} />
      {elements.length > 0 && (
        <ul className={`grid gap-5 ${GRILLES[colonnes]}`}>
          {elements.map((el, i) => (
            <Reveal
              as="li"
              key={i}
              delay={Math.min(i, 6) * 0.06}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-gray-900">
                <Icone nom={el.icone} />
              </span>
              {txt(el.titre) && <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-gray-900">{txt(el.titre)}</h3>}
              {txt(el.texte) && (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-500">{txt(el.texte)}</p>
              )}
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
