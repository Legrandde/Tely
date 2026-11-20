import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BadgeCheck, CheckCircle2, FileText, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useSite } from "@/context/SiteContext";
import { useCtaInscription } from "./useCtaInscription";
import { statsAffichables } from "./stats";
import Compteur from "./Compteur";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const conteneur: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const element: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const ESPACE_PAR_ROLE: Record<string, string> = {
  eleve: "/espace",
  professeur: "/Dashboard-professeur",
  administrateur: "/Dashbord-admin",
};

/** Hero de la landing : proposition de valeur SaaS moderne, double CTA shadcn/ui et preuve sociale en direct. */
const HeroSection = forwardRef<HTMLDivElement>(function HeroSection(_props, finRef) {
  const { isAuthenticated, user } = useAuth();
  const { stats, loading } = useSite();
  const cta = useCtaInscription();
  const chiffres = statsAffichables(stats, 3);
  const chargementStats = loading && !stats;

  return (
    <section aria-labelledby="hero-titre" className="relative overflow-hidden border-b border-border/60 bg-background">
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-amber-400/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        {/* Texte */}
        <motion.div variants={conteneur} initial="hidden" animate="show" className="flex flex-col items-start">
          <motion.div variants={element}>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium bg-card shadow-2xs gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" aria-hidden="true" />
              Collège · Lycée · Brevet · BAC
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-titre"
            variants={element}
            className="tely-title mt-5 text-[2.2rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem]"
          >
            Révisez mieux.{" "}
            <span className="text-amber-500">Réussissez</span> vos examens.
          </motion.h1>

          <motion.p
            variants={element}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Des exercices corrigés, des anciens sujets d'examen et des corrections détaillées rédigées par des
            enseignants, classés par matière et par niveau. Entraînez-vous à votre rythme, sur téléphone ou ordinateur.
          </motion.p>

          <motion.div variants={element} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {isAuthenticated ? (
              <>
                <Button asChild variant="brand" size="lg" className="h-12 px-6 text-sm sm:text-base">
                  <Link to={ESPACE_PAR_ROLE[user?.role ?? "eleve"] ?? "/espace"}>
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Accéder à mon espace
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm sm:text-base">
                  <Link to="/exercices">Explorer les exercices</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="brand" size="lg" className="h-12 px-6 text-sm sm:text-base">
                  <Link to={cta.to}>
                    {cta.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm sm:text-base">
                  <Link to={cta.inscriptionsOuvertes ? "/exercices" : "/sujets"}>
                    {cta.inscriptionsOuvertes ? "Voir les exercices" : "Voir les sujets d'examen"}
                  </Link>
                </Button>
              </>
            )}
          </motion.div>

          {!isAuthenticated && cta.inscriptionsOuvertes && (
            <motion.ul
              variants={element}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-muted-foreground sm:text-sm"
            >
              {["100 % gratuit pour les élèves", "Sans engagement", "Connexion avec Google"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </motion.ul>
          )}

          {/* Preuve sociale chiffrée (en direct) */}
          <motion.div variants={element} className="mt-10 min-h-[4.25rem] w-full">
            {chargementStats ? (
              <div className="flex gap-8" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : chiffres.length > 0 ? (
              <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
                {chiffres.map((s) => (
                  <div key={s.cle} className="flex flex-col-reverse">
                    <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{s.libelle}</dt>
                    <dd className="tely-title text-2xl sm:text-3xl">
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
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

          <div className="absolute -left-3 top-8 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg sm:-left-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-emerald-600">
              <BadgeCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-semibold text-foreground">Corrigé détaillé</span>
              <span className="block text-[11px] text-muted-foreground">Étape par étape</span>
            </span>
          </div>

          <div className="absolute -right-2 bottom-8 flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-primary px-3.5 py-2.5 text-primary-foreground shadow-lg sm:-right-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-semibold">Anciens sujets</span>
              <span className="block text-[11px] text-zinc-400">Brevet, BAC, compositions</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Sentinelle : fin du hero */}
      <div ref={finRef} aria-hidden="true" className="h-px w-full" />
    </section>
  );
});

export default HeroSection;
