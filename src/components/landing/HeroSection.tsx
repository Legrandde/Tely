import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BadgeCheck, CheckCircle2, FileText, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSite } from "../../context/SiteContext";
import { useCtaInscription } from "./useCtaInscription";
import { statsAffichables } from "./stats";
import Compteur from "./Compteur";

const conteneur: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const element: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ESPACE_PAR_ROLE: Record<string, string> = {
  eleve: "/espace",
  professeur: "/Dashboard-professeur",
  administrateur: "/Dashbord-admin",
};

/** Hero de la landing : proposition de valeur, double CTA et preuve sociale chiffrée en direct. */
const HeroSection = forwardRef<HTMLDivElement>(function HeroSection(_props, finRef) {
  const { isAuthenticated, user } = useAuth();
  const { stats, loading } = useSite();
  const cta = useCtaInscription();
  const chiffres = statsAffichables(stats, 3);
  const chargementStats = loading && !stats;

  return (
    <section aria-labelledby="hero-titre" className="relative overflow-hidden">
      <div className="bg-grid-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-300/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
        {/* Texte */}
        <motion.div variants={conteneur} initial="hidden" animate="show" className="flex flex-col items-start">
          <motion.span
            variants={element}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
            Collège · Lycée · Brevet · BAC
          </motion.span>

          <motion.h1
            id="hero-titre"
            variants={element}
            className="tely-title mt-5 text-[2.1rem] leading-[1.08] sm:text-5xl lg:text-[3.6rem]"
          >
            Révisez mieux.{" "}
            <span className="relative whitespace-nowrap text-amber-600">
              Réussissez
              <svg
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-amber-300"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 7 Q100 1 198 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            vos examens.
          </motion.h1>

          <motion.p variants={element} className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Des exercices corrigés, des anciens sujets d'examen et des corrections détaillées rédigées par des
            enseignants, classés par matière et par niveau. Entraînez-vous à votre rythme, sur téléphone ou ordinateur.
          </motion.p>

          <motion.div variants={element} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link
                  to={ESPACE_PAR_ROLE[user?.role ?? "eleve"] ?? "/espace"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-base font-semibold text-gray-900 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 motion-safe:hover:-translate-y-0.5"
                >
                  <LayoutDashboard size={18} aria-hidden="true" />
                  Accéder à mon espace
                </Link>
                <Link
                  to="/exercices"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  Explorer les exercices
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={cta.to}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-base font-semibold text-gray-900 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 motion-safe:hover:-translate-y-0.5"
                >
                  {cta.label}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                {cta.inscriptionsOuvertes ? (
                  <Link
                    to="/exercices"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    Voir les exercices
                  </Link>
                ) : (
                  <Link
                    to="/sujets"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    Voir les sujets d'examen
                  </Link>
                )}
              </>
            )}
          </motion.div>

          {!isAuthenticated && cta.inscriptionsOuvertes && (
            <motion.ul
              variants={element}
              className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500 sm:text-sm"
            >
              {["100 % gratuit pour les élèves", "Sans engagement", "Connexion avec Google"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </motion.ul>
          )}

          {/* Preuve sociale chiffrée (en direct) — hauteur réservée pour éviter le décalage */}
          <motion.div variants={element} className="mt-10 min-h-[4.25rem] w-full">
            {chargementStats ? (
              <div className="flex gap-8" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-7 w-20 animate-pulse rounded-md bg-amber-200/60" />
                    <div className="h-3 w-24 animate-pulse rounded bg-amber-100" />
                  </div>
                ))}
              </div>
            ) : chiffres.length > 0 ? (
              <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-amber-200/70 pt-5">
                {chiffres.map((s) => (
                  <div key={s.cle} className="flex flex-col-reverse">
                    <dt className="text-xs font-medium text-gray-500 sm:text-sm">{s.libelle}</dt>
                    <dd className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                      <Compteur valeur={s.valeur} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </motion.div>
        </motion.div>

        {/* Visuel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-none"
        >
          <div className="absolute inset-6 rounded-[2.5rem] bg-amber-400/30 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-amber-100 shadow-2xl shadow-amber-900/10">
            <img
              src="/banner3.png"
              alt="Des élèves souriants prêts à réviser avec Tely"
              width={736}
              height={736}
              fetchPriority="high"
              decoding="async"
              className="aspect-square h-auto w-full object-cover"
            />
          </div>

          <div className="absolute -left-3 top-8 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl sm:-left-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BadgeCheck size={18} aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-gray-900">Corrigé détaillé</span>
              <span className="block text-[11px] text-gray-500">Étape par étape</span>
            </span>
          </div>

          <div className="absolute -right-2 bottom-10 flex items-center gap-2.5 rounded-2xl bg-gray-900 px-3.5 py-2.5 text-white shadow-xl sm:-right-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-gray-900">
              <FileText size={18} aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold">Anciens sujets</span>
              <span className="block text-[11px] text-gray-300">Brevet, BAC, compositions</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Sentinelle : fin du hero (déclenche le CTA mobile collant) */}
      <div ref={finRef} aria-hidden="true" className="h-px w-full" />
    </section>
  );
});

export default HeroSection;
