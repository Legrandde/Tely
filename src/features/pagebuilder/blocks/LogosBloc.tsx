import type { BlocRenduProps, LogoItem } from "../types";
import { lien, liste, txt } from "../utils/props";
import { ImageSure, Reveal, SmartLink } from "./shared";

export default function LogosBloc({ props }: BlocRenduProps<"logos">) {
  const titre = txt(props.titre);
  const logos = liste<LogoItem>(props.elements)
    .map((e) => ({ nom: txt(e.nom), image: lien(e.image), lien: lien(e.lien) }))
    .filter((e) => e.image || e.nom);
  if (logos.length === 0 && !titre) return null;

  return (
    <section className="bg-white px-4 py-12 @3xl:px-8 @3xl:py-16">
      <div className="mx-auto max-w-6xl">
        {titre && (
          <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{titre}</h2>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 @3xl:gap-x-14">
          {logos.map((l, i) => {
            const contenu = l.image ? (
              <ImageSure
                src={l.image}
                alt={l.nom || "Logo partenaire"}
                className="h-9 w-auto max-w-[140px] object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 @3xl:h-10"
              />
            ) : (
              <span className="text-lg font-bold tracking-[-0.01em] text-gray-400 transition-colors hover:text-gray-900">{l.nom}</span>
            );
            return (
              <Reveal as="li" key={i} delay={Math.min(i, 8) * 0.04}>
                {l.lien ? (
                  <SmartLink href={l.lien} aria-label={l.nom || undefined} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                    {contenu}
                  </SmartLink>
                ) : (
                  contenu
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
