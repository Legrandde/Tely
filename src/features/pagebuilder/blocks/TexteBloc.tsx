import type { BlocRenduProps } from "../types";
import { choix, txt } from "../utils/props";
import Markdown from "./Markdown";
import { Reveal, Section } from "./shared";

export default function TexteBloc({ props }: BlocRenduProps<"texte">) {
  const titre = txt(props.titre);
  const contenu = txt(props.contenu);
  const centre = choix(props.alignement, ["gauche", "centre"] as const, "gauche") === "centre";
  if (!titre && !contenu) return null;

  return (
    <Section fond="blanc" etroit>
      <Reveal className={centre ? "text-center" : ""}>
        {titre && (
          <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-gray-900 @3xl:text-[34px]">
            {titre}
          </h2>
        )}
        {contenu && (
          <Markdown
            texte={contenu}
            className={`text-base leading-[1.75] text-gray-600 @3xl:text-[17px] ${titre ? "mt-5" : ""} ${
              centre ? "[&_ol]:inline-block [&_ol]:text-left [&_ul]:inline-block [&_ul]:text-left" : ""
            }`}
          />
        )}
      </Reveal>
    </Section>
  );
}
