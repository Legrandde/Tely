import type { BlocRenduProps } from "../types";
import { choix, lien, txt } from "../utils/props";
import Markdown from "./Markdown";
import { BoutonLien, ImageSure, Reveal, Section } from "./shared";

export default function TexteImageBloc({ props }: BlocRenduProps<"texte_image">) {
  const titre = txt(props.titre);
  const contenu = txt(props.contenu);
  const image = lien(props.image);
  const bouton = txt(props.bouton_texte);
  const imageAGauche = choix(props.position_image, ["gauche", "droite"] as const, "droite") === "gauche";
  if (!titre && !contenu && !image && !bouton) return null;

  const texte = (titre || contenu || bouton) && (
    <Reveal className="flex flex-col justify-center">
      {titre && (
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-gray-900 @3xl:text-4xl">{titre}</h2>
      )}
      {contenu && (
        <Markdown texte={contenu} className={`text-base leading-[1.75] text-gray-600 ${titre ? "mt-4" : ""}`} />
      )}
      {bouton && (
        <div className="mt-7">
          <BoutonLien texte={bouton} href={lien(props.bouton_lien)} />
        </div>
      )}
    </Reveal>
  );

  return (
    <Section fond="blanc">
      <div className={`grid items-center gap-10 ${texte && image ? "@3xl:grid-cols-2 @3xl:gap-16" : ""}`}>
        {image && (
          <Reveal delay={0.1} className={imageAGauche ? "" : "@3xl:order-2"}>
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-3 -z-0 rounded-[28px] bg-amber-100/70 rotate-[-1.5deg]" />
              <ImageSure
                src={image}
                alt={txt(props.alt)}
                className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl shadow-gray-900/10"
              />
            </div>
          </Reveal>
        )}
        {texte}
      </div>
    </Section>
  );
}
