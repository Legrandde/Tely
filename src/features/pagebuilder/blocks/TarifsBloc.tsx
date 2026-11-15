import { Check } from "lucide-react";
import type { BlocRenduProps, TarifItem } from "../types";
import { lien, liste, listeTextes, txt } from "../utils/props";
import { BoutonLien, EnteteSection, Reveal, Section } from "./shared";

export default function TarifsBloc({ props }: BlocRenduProps<"tarifs">) {
  const titre = txt(props.titre);
  const sousTitre = txt(props.sous_titre);
  const offres = liste<TarifItem>(props.elements)
    .map((e) => ({
      nom: txt(e.nom),
      prix: txt(e.prix),
      periode: txt(e.periode),
      description: txt(e.description),
      points: listeTextes(e.points),
      bouton_texte: txt(e.bouton_texte),
      bouton_lien: lien(e.bouton_lien),
      mis_en_avant: e.mis_en_avant === true,
    }))
    .filter((e) => e.nom || e.prix);
  if (!titre && !sousTitre && offres.length === 0) return null;

  const grille = offres.length === 1 ? "max-w-md mx-auto" : offres.length === 2 ? "@3xl:grid-cols-2 max-w-4xl mx-auto" : "@3xl:grid-cols-2 @5xl:grid-cols-3";

  return (
    <Section fond="creme">
      <EnteteSection titre={titre} sousTitre={sousTitre} />
      {offres.length > 0 && (
        <ul className={`grid items-stretch gap-6 ${grille}`}>
          {offres.map((o, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className="flex">
              <article
                className={`relative flex w-full flex-col rounded-3xl p-7 @3xl:p-8 ${
                  o.mis_en_avant
                    ? "bg-gray-900 text-white shadow-2xl shadow-gray-900/25 ring-2 ring-amber-500"
                    : "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5"
                }`}
              >
                {o.mis_en_avant && (
                  <span className="absolute -top-3 left-7 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-900">
                    Recommandé
                  </span>
                )}
                {o.nom && <h3 className="text-lg font-bold">{o.nom}</h3>}
                {o.description && (
                  <p className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${o.mis_en_avant ? "text-white/65" : "text-gray-500"}`}>
                    {o.description}
                  </p>
                )}
                {o.prix && (
                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-[-0.03em]">{o.prix}</span>
                    {o.periode && (
                      <span className={`text-sm ${o.mis_en_avant ? "text-white/60" : "text-gray-500"}`}>{o.periode}</span>
                    )}
                  </p>
                )}
                {o.points.length > 0 && (
                  <ul className="mt-6 flex-1 space-y-3">
                    {o.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            o.mis_en_avant ? "bg-amber-500 text-gray-900" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className={o.mis_en_avant ? "text-white/85" : "text-gray-700"}>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {o.bouton_texte && (
                  <div className={o.points.length > 0 ? "mt-8" : "mt-auto pt-8"}>
                    <BoutonLien
                      texte={o.bouton_texte}
                      href={o.bouton_lien}
                      variante={o.mis_en_avant ? "ambre" : "primaire"}
                      className="w-full"
                    />
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
