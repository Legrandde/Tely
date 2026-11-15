import type { BlocRenduProps } from "../types";
import { choix, lien, txt } from "../utils/props";
import { BoutonLien, Reveal } from "./shared";

const STYLES = {
  sombre: { carte: "bg-gray-900 text-white", texte: "text-white/70", motif: "bg-grid-pattern-dark", bouton: "ambre" },
  ambre: { carte: "bg-amber-500 text-gray-900", texte: "text-gray-900/75", motif: "bg-grid-pattern-subtle", bouton: "primaire" },
  creme: { carte: "bg-amber-50 text-gray-900 ring-1 ring-amber-200/60", texte: "text-gray-600", motif: "bg-grid-pattern", bouton: "primaire" },
} as const;

export default function CtaBloc({ props }: BlocRenduProps<"cta">) {
  const titre = txt(props.titre);
  const texte = txt(props.texte);
  const bouton = txt(props.bouton_texte);
  const fond = choix(props.fond, ["sombre", "ambre", "creme"] as const, "sombre");
  if (!titre && !texte && !bouton) return null;
  const s = STYLES[fond];

  return (
    <section className="bg-white px-4 py-12 @3xl:px-8 @3xl:py-16">
      <Reveal className={`relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-14 text-center shadow-xl shadow-gray-900/10 @3xl:px-16 @3xl:py-20 ${s.carte}`}>
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${s.motif} [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]`} />
        {fond === "sombre" && (
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/2 h-60 w-[28rem] max-w-full -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl" />
        )}
        <div className="relative mx-auto max-w-2xl">
          {titre && <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] @3xl:text-[40px]">{titre}</h2>}
          {texte && <p className={`mt-4 text-base leading-relaxed whitespace-pre-line @3xl:text-lg ${s.texte}`}>{texte}</p>}
          {bouton && (
            <div className="mt-8">
              <BoutonLien texte={bouton} href={lien(props.bouton_lien)} variante={s.bouton} />
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
