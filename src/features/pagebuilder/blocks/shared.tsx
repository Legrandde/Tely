/**
 * Primitives de rendu partagées par les blocs : liens sûrs, apparition animée,
 * conteneurs de section, en-têtes de section, boutons.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { typeLien } from "../utils/liens";
import { resolveImageUrl } from "../../../utils/imageUrl";

// ─── Liens ────────────────────────────────────────────────────────────────

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

/** Lien interne → <Link>, externe → nouvel onglet sécurisé, lien non autorisé → simple texte. */
export function SmartLink({ href, children, className, ...rest }: SmartLinkProps) {
  const t = typeLien(href);
  if (t === "interne") {
    return (
      <Link to={href.trim()} className={className} aria-label={rest["aria-label"]}>
        {children}
      </Link>
    );
  }
  if (t === "externe") {
    return (
      <a
        href={href.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={rest["aria-label"]}
      >
        {children}
      </a>
    );
  }
  if (t === "ancre" || t === "contact") {
    return (
      <a href={href.trim()} className={className} aria-label={rest["aria-label"]}>
        {children}
      </a>
    );
  }
  return <span className={className}>{children}</span>;
}

// ─── Boutons ──────────────────────────────────────────────────────────────

type VarianteBouton = "primaire" | "ambre" | "clair" | "contour" | "contour-clair";

const VARIANTES: Record<VarianteBouton, string> = {
  primaire: "bg-gray-900 text-white hover:bg-gray-700 shadow-lg shadow-gray-900/10",
  ambre: "bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg shadow-amber-500/25",
  clair: "bg-white text-gray-900 hover:bg-amber-50 shadow-lg shadow-black/10",
  contour: "bg-white/70 text-gray-900 border border-gray-200 hover:bg-white hover:border-gray-300",
  "contour-clair": "bg-transparent text-white border border-white/30 hover:bg-white/10",
};

export function BoutonLien({
  texte,
  href,
  variante = "primaire",
  className = "",
}: {
  texte: string;
  href: string;
  variante?: VarianteBouton;
  className?: string;
}) {
  if (!texte) return null;
  const externe = typeLien(href) === "externe";
  const Icone = externe ? ArrowUpRight : ArrowRight;
  return (
    <SmartLink
      href={href || "#"}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold tracking-[0.01em] transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${VARIANTES[variante]} ${className}`}
    >
      {texte}
      <Icone size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
    </SmartLink>
  );
}

// ─── Animation d'apparition (respecte prefers-reduced-motion) ──────────────

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduire = useReducedMotion();
  const Comp = as === "li" ? motion.li : as === "article" ? motion.article : motion.div;
  if (reduire) {
    const Statique = as;
    return <Statique className={className}>{children}</Statique>;
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </Comp>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────

const FONDS_SECTION = {
  creme: "bg-amber-50 text-gray-900",
  blanc: "bg-white text-gray-900",
  sombre: "bg-gray-900 text-white",
  ambre: "bg-amber-500 text-gray-900",
} as const;

export function Section({
  children,
  fond = "blanc",
  className = "",
  etroit = false,
  ariaLabel,
}: {
  children: ReactNode;
  fond?: keyof typeof FONDS_SECTION;
  className?: string;
  etroit?: boolean;
  ariaLabel?: string;
}) {
  return (
    <section aria-label={ariaLabel} className={`${FONDS_SECTION[fond]} px-4 py-14 @3xl:px-8 @3xl:py-20 ${className}`}>
      <div className={`mx-auto w-full ${etroit ? "max-w-3xl" : "max-w-6xl"}`}>{children}</div>
    </section>
  );
}

/** En-tête de section (h2 + sous-titre), n'affiche rien si les deux sont vides. */
export function EnteteSection({
  titre,
  sousTitre,
  centre = true,
  clair = false,
}: {
  titre: string;
  sousTitre?: string;
  centre?: boolean;
  clair?: boolean;
}) {
  if (!titre && !sousTitre) return null;
  return (
    <Reveal className={`mb-10 @3xl:mb-14 ${centre ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {titre && (
        <h2
          className={`text-[28px] font-bold leading-tight tracking-[-0.02em] @3xl:text-4xl ${clair ? "text-white" : "text-gray-900"}`}
        >
          {titre}
        </h2>
      )}
      {sousTitre && (
        <p className={`mt-3 text-base leading-relaxed whitespace-pre-line @3xl:text-lg ${clair ? "text-white/70" : "text-gray-500"}`}>
          {sousTitre}
        </p>
      )}
    </Reveal>
  );
}

// ─── Images ───────────────────────────────────────────────────────────────

export function ImageSure({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const url = resolveImageUrl(src);
  if (!url) return null;
  return <img src={url} alt={alt} className={className} loading={loading} decoding="async" />;
}
