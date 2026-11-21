import { forwardRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useSite } from "@/context/SiteContext";
import { useCtaInscription } from "./useCtaInscription";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModeHero = "eleves" | "enseignants";

const ESPACE_PAR_ROLE: Record<string, string> = {
  eleve: "/espace",
  professeur: "/Dashboard-professeur",
  administrateur: "/Dashbord-admin",
};

const SLIDES_GUINEE = [
  {
    src: "/hero-college-bepc.jpg",
    alt: "Collégiens et lycéens guinéens en uniforme kaki dans la cour d'un établissement à Matoto (BEPC)",
    position: "object-[center_32%]",
  },
  {
    src: "/hero-lycee-kankan.jpg",
    alt: "Élèves de collège et de lycée en salle de classe à Kankan",
    position: "object-[center_45%]",
  },
  {
    src: "/hero-lycee-labe.jpg",
    alt: "Lycéens et collégiens guinéens attentifs en classe face au tableau à Labé",
    position: "object-[center_52%]",
  },
  {
    src: "/hero-lycee-matoto.jpg",
    alt: "Élèves guinéens en uniforme lors de la montée du drapeau dans la cour d'un collège-lycée à Matoto",
    position: "object-[center_38%]",
  },
];

const INTERVALLE_MS = 5500;

/**
 * Bannière Hero éditoriale avec carrousel d'images d'élèves guinéens :
 * carte arrondie plein cadre, transitions fluides, sélecteur vitré Élèves / Enseignants,
 * titre blanc percutant et bouton pilule lumineux.
 */
const HeroSection = forwardRef<HTMLDivElement>(function HeroSection(_props, finRef) {
  const { isAuthenticated, user } = useAuth();
  const { parametres } = useSite();
  const cta = useCtaInscription();
  const [mode, setMode] = useState<ModeHero>("eleves");
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const candidaturesOuvertes = parametres?.candidatures_ouvertes !== "0";

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES_GUINEE.length);
    }, INTERVALLE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const precedent = () =>
    setSlideIndex((prev) => (prev - 1 + SLIDES_GUINEE.length) % SLIDES_GUINEE.length);
  const suivant = () =>
    setSlideIndex((prev) => (prev + 1) % SLIDES_GUINEE.length);

  const slideActuel = SLIDES_GUINEE[slideIndex];

  const contenu =
    mode === "eleves"
      ? {
          titreLigne1: "Révisez au rythme",
          titreLigne2: "de votre ambition",
          description:
            "Accédez à des exercices corrigés, d'anciens sujets d'examen et des explications détaillées pour transformer chaque révision en réussite.",
          ctaLabel: isAuthenticated ? "Accéder à mon espace" : "Commencer",
          ctaTo: isAuthenticated
            ? ESPACE_PAR_ROLE[user?.role ?? "eleve"] ?? "/espace"
            : cta.to,
        }
      : {
          titreLigne1: "Partagez votre savoir",
          titreLigne2: "sans limites",
          description:
            "Publiez vos exercices, sujets du Brevet ou du BAC et corrigés détaillés pour accompagner des milliers d'élèves au quotidien.",
          ctaLabel:
            isAuthenticated && user?.role === "professeur"
              ? "Mon espace enseignant"
              : "Rejoindre l'équipe",
          ctaTo:
            isAuthenticated && user?.role === "professeur"
              ? "/Dashboard-professeur"
              : candidaturesOuvertes
              ? "/#enseignants"
              : "/auth/signup",
        };

  return (
    <section aria-labelledby="hero-titre" className="bg-background px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative flex min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] w-full items-center overflow-hidden rounded-[28px] bg-zinc-950 shadow-xl"
        >
          {/* Carrousel d'images plein cadre avec fondu fluide */}
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={slideActuel.src}
              src={slideActuel.src}
              alt={slideActuel.alt}
              fetchPriority={slideIndex === 0 ? "high" : "auto"}
              decoding="async"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                slideActuel.position
              )}
            />
          </AnimatePresence>

          {/* Dégradé sombre directionnel gauche -> droite pour un contraste impeccable */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/85 via-black/55 to-black/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/15"
          />

          {/* Contenu ancré à gauche */}
          <div className="relative z-10 flex w-full max-w-2xl flex-col items-start px-6 py-12 sm:px-12 lg:px-16">
            {/* Sélecteur vitré (Élèves / Enseignants) */}
            <div
              role="tablist"
              aria-label="Choisir votre profil"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/15 p-1 backdrop-blur-md"
            >
              {(
                [
                  { id: "eleves", label: "Élèves" },
                  { id: "enseignants", label: "Enseignants" },
                ] as const
              ).map((tab) => {
                const actif = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={actif}
                    onClick={() => setMode(tab.id)}
                    className={cn(
                      "rounded-full px-5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                      actif
                        ? "bg-zinc-950/90 text-white shadow-sm"
                        : "text-white/90 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Titre, sous-titre et CTA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-7 flex flex-col items-start"
              >
                <h1
                  id="hero-titre"
                  className="tely-title text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]"
                >
                  {contenu.titreLigne1}
                  <br />
                  {contenu.titreLigne2}
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg">
                  {contenu.description}
                </p>

                <div className="mt-8">
                  <Button asChild variant="brand" size="lg" className="h-11 px-6 text-sm sm:h-12 sm:px-7 sm:text-base">
                    <Link to={contenu.ctaTo}>
                      {contenu.ctaLabel}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Contrôles discrets du carrousel en bas à droite */}
          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6">
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-md">
              {SLIDES_GUINEE.map((slide, idx) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Afficher l'image ${idx + 1} sur ${SLIDES_GUINEE.length}`}
                  aria-current={idx === slideIndex ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    idx === slideIndex
                      ? "w-6 bg-amber-400"
                      : "w-1.5 bg-white/45 hover:bg-white/75"
                  )}
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={precedent}
                aria-label="Image précédente"
                className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={suivant}
                aria-label="Image suivante"
                className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sentinelle : fin du hero (déclenche le CTA mobile collant) */}
      <div ref={finRef} aria-hidden="true" className="h-px w-full" />
    </section>
  );
});

export default HeroSection;
