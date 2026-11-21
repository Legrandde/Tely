import { motion, useReducedMotion } from "framer-motion";
import type { BlocRenduProps } from "../types";
import { choix, lien, txt } from "../utils/props";
import { BoutonLien, ImageSure } from "./shared";

const BANNIERE_DEFAUT = "/hero-lycee-kankan.jpg";

export default function HeroBloc({ props }: BlocRenduProps<"hero">) {
  const reduire = useReducedMotion();
  const titre = txt(props.titre);
  const sousTitre = txt(props.sous_titre);
  const b1 = txt(props.bouton_texte);
  const b2 = txt(props.bouton2_texte);
  const image = lien(props.image);
  const centre = choix(props.alignement, ["centre", "gauche"] as const, "centre") === "centre";
  const banniereSrc = image || BANNIERE_DEFAUT;

  const anim = (delay: number) =>
    reduire
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: "easeOut" as const, delay },
        };

  return (
    <section className="bg-background px-4 pb-4 pt-5 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-zinc-950 text-white shadow-xl">
        {/* Image de bannière en arrière-plan */}
        <ImageSure
          src={banniereSrc}
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />

        {/* Voile dégradé pour garantir un contraste net du texte */}
        <div
          aria-hidden="true"
          className={
            centre
              ? "pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/70 to-zinc-950/85"
              : "pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/92 via-zinc-950/72 to-zinc-950/30"
          }
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-12 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"
        />

        <div
          className={`relative z-10 flex min-h-[260px] flex-col justify-center px-7 py-14 sm:min-h-[320px] sm:px-12 sm:py-20 lg:px-16 ${
            centre ? "items-center text-center" : "items-start text-left"
          }`}
        >
          <div className={centre ? "mx-auto max-w-3xl" : "max-w-2xl"}>
            {titre && (
              <motion.h1
                {...anim(0)}
                className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl"
              >
                {titre}
              </motion.h1>
            )}
            {sousTitre && (
              <motion.p
                {...anim(0.1)}
                className={`mt-4 text-base leading-relaxed whitespace-pre-line text-white/85 sm:text-lg ${
                  centre ? "mx-auto max-w-2xl" : "max-w-xl"
                }`}
              >
                {sousTitre}
              </motion.p>
            )}
            {(b1 || b2) && (
              <motion.div
                {...anim(0.2)}
                className={`mt-7 flex flex-col gap-3 sm:flex-row ${centre ? "sm:justify-center" : ""}`}
              >
                <BoutonLien texte={b1} href={lien(props.bouton_lien)} variante="ambre" />
                <BoutonLien texte={b2} href={lien(props.bouton2_lien)} variante="contour-clair" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
