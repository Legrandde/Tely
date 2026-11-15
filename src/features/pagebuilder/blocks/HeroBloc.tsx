import { motion, useReducedMotion } from "framer-motion";
import type { BlocRenduProps } from "../types";
import { choix, lien, txt } from "../utils/props";
import { BoutonLien, ImageSure } from "./shared";

const FONDS = {
  creme: { section: "bg-amber-50 text-gray-900", motif: "bg-grid-pattern", sous: "text-gray-600" },
  blanc: { section: "bg-white text-gray-900", motif: "bg-grid-pattern-subtle", sous: "text-gray-500" },
  sombre: { section: "bg-gray-900 text-white", motif: "bg-grid-pattern-dark", sous: "text-white/70" },
  ambre: { section: "bg-amber-500 text-gray-900", motif: "bg-grid-pattern-subtle", sous: "text-gray-900/75" },
} as const;

export default function HeroBloc({ props }: BlocRenduProps<"hero">) {
  const reduire = useReducedMotion();
  const titre = txt(props.titre);
  const sousTitre = txt(props.sous_titre);
  const b1 = txt(props.bouton_texte);
  const b2 = txt(props.bouton2_texte);
  const image = lien(props.image);
  const fond = choix(props.fond, ["creme", "blanc", "sombre", "ambre"] as const, "creme");
  const centre = choix(props.alignement, ["centre", "gauche"] as const, "centre") === "centre";
  const deuxColonnes = !centre && !!image;
  const style = FONDS[fond];

  const v1 = fond === "sombre" ? "ambre" : "primaire";
  const v2 = fond === "sombre" ? "contour-clair" : fond === "ambre" ? "clair" : "contour";

  const anim = (delay: number) =>
    reduire
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: "easeOut" as const, delay },
        };

  return (
    <section className={`relative overflow-hidden ${style.section}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${style.motif} [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]`} />
      {fond !== "ambre" && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] max-w-full -translate-x-1/2 rounded-full blur-3xl ${fond === "sombre" ? "bg-amber-500/20" : "bg-amber-300/30"}`}
        />
      )}

      <div
        className={`relative mx-auto w-full max-w-6xl px-4 py-16 @3xl:px-8 @3xl:py-24 ${
          deuxColonnes ? "grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-14" : ""
        }`}
      >
        <div className={centre ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
          {titre && (
            <motion.h1
              {...anim(0)}
              className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em] @2xl:text-5xl @5xl:text-6xl"
            >
              {titre}
            </motion.h1>
          )}
          {sousTitre && (
            <motion.p
              {...anim(0.1)}
              className={`mt-5 text-base leading-relaxed whitespace-pre-line @3xl:text-lg ${style.sous} ${centre ? "mx-auto max-w-2xl" : ""}`}
            >
              {sousTitre}
            </motion.p>
          )}
          {(b1 || b2) && (
            <motion.div
              {...anim(0.2)}
              className={`mt-8 flex flex-col gap-3 @xl:flex-row ${centre ? "@xl:justify-center" : ""}`}
            >
              <BoutonLien texte={b1} href={lien(props.bouton_lien)} variante={v1} />
              <BoutonLien texte={b2} href={lien(props.bouton2_lien)} variante={v2} />
            </motion.div>
          )}
        </div>

        {image && (
          <motion.div
            {...(reduire
              ? {}
              : {
                  initial: { opacity: 0, y: 28, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.3 },
                })}
            className={deuxColonnes ? "" : "mx-auto mt-12 max-w-5xl @3xl:mt-16"}
          >
            <ImageSure
              src={image}
              alt=""
              loading="eager"
              className={`w-full rounded-2xl object-cover shadow-2xl ring-1 ${
                fond === "sombre" ? "shadow-black/40 ring-white/10" : "shadow-gray-900/10 ring-gray-900/5"
              } ${deuxColonnes ? "aspect-[4/3]" : "max-h-[520px]"}`}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
