import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import NouvelleLettre from "../components/NouvelleLettre";
import GoogleOneTap from "../components/auth/GoogleOneTap";
import ProfesseurJoinSection from "../components/landing/ProfesseurJoinSection";
import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import BenefitsSection from "../components/landing/BenefitsSection";
import ExploreSection from "../components/landing/ExploreSection";
import RecentExercises from "../components/landing/RecentExercises";
import FaqSection from "../components/landing/FaqSection";
import DerniersArticles from "../features/blog/components/DerniersArticles";
import FinalCta from "../components/landing/FinalCta";
import LandingSkeleton from "../components/landing/LandingSkeleton";
import { FAQ } from "../components/landing/faqData";
import { useCtaInscription } from "../components/landing/useCtaInscription";
import StickyCta from "../components/site/StickyCta";
import { useAuth } from "../context/authContext";
import { useSite, useSiteNom } from "../context/SiteContext";
import { useJsonLd, useSeo } from "../hooks/useSeo";
import { getPageAccueil } from "../services/siteService";
import type { PagePublique } from "../types/site";

// Rendu des pages CMS (agent Page builder) — chargé uniquement si une page d'accueil est publiée.
const PageRenderer = lazy(() => import("../features/pagebuilder/PageRenderer"));
type BlocsRenderer = ComponentProps<typeof PageRenderer>["blocs"];

type EtatAccueil = { statut: "chargement" } | { statut: "defaut" } | { statut: "cms"; page: PagePublique };

/** Réponse définitive de /api/site/accueil, gardée pour la session (pas de nouveau squelette au retour). */
let cacheAccueil: EtatAccueil | null = null;
const DELAI_ACCUEIL_MS = 2500;

const TITRE_DEFAUT = "Exercices corrigés et sujets d'examen pour réussir";
const DESCRIPTION_DEFAUT =
  "Révisez avec des exercices corrigés, des anciens sujets d'examen (Brevet, BAC) et des corrections détaillées, classés par matière et par niveau. Inscription gratuite.";

export default function Landing() {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { parametres } = useSite();
  const siteNom = useSiteNom();
  const cta = useCtaInscription();
  const finHeroRef = useRef<HTMLDivElement>(null);

  const [etat, setEtat] = useState<EtatAccueil>(() => cacheAccueil ?? { statut: "chargement" });

  // Page d'accueil CMS : si aucune réponse sous 2,5 s, on affiche la landing par défaut.
  useEffect(() => {
    if (cacheAccueil) return;
    const controleur = new AbortController();
    let regle = false;

    const minuteur = window.setTimeout(() => {
      if (regle) return;
      regle = true;
      controleur.abort();
      setEtat({ statut: "defaut" });
    }, DELAI_ACCUEIL_MS);

    getPageAccueil(controleur.signal)
      .then((page) => {
        if (regle) return;
        regle = true;
        window.clearTimeout(minuteur);
        const resultat: EtatAccueil = page ? { statut: "cms", page } : { statut: "defaut" };
        cacheAccueil = resultat;
        setEtat(resultat);
      })
      .catch(() => {
        if (regle) return;
        regle = true;
        window.clearTimeout(minuteur);
        setEtat({ statut: "defaut" });
      });

    return () => {
      regle = true;
      window.clearTimeout(minuteur);
      controleur.abort();
    };
  }, []);

  const page = etat.statut === "cms" ? etat.page : null;

  useSeo({
    title: page ? page.titre : TITRE_DEFAUT,
    description: page?.meta_description || DESCRIPTION_DEFAUT,
    image: page?.image_og || "/banner3.png",
  });

  // Données structurées Organization + WebSite
  const jsonLdSite = useMemo(() => {
    const origine = window.location.origin;
    const sameAs = ["reseau_facebook", "reseau_instagram", "reseau_linkedin", "reseau_youtube", "reseau_tiktok"]
      .map((cle) => parametres?.[cle]?.trim())
      .filter((u): u is string => !!u && /^https?:\/\//i.test(u));
    const organisation: Record<string, unknown> = {
      "@type": "EducationalOrganization",
      "@id": `${origine}/#organisation`,
      name: siteNom,
      url: `${origine}/`,
      logo: `${origine}/favicon.svg`,
    };
    if (parametres?.site_description) organisation.description = parametres.site_description;
    if (parametres?.contact_email) organisation.email = parametres.contact_email;
    if (parametres?.contact_telephone) organisation.telephone = parametres.contact_telephone;
    if (sameAs.length) organisation.sameAs = sameAs;
    return {
      "@context": "https://schema.org",
      "@graph": [
        organisation,
        {
          "@type": "WebSite",
          "@id": `${origine}/#website`,
          name: siteNom,
          url: `${origine}/`,
          inLanguage: "fr",
          publisher: { "@id": `${origine}/#organisation` },
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${origine}/exercices?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };
  }, [parametres, siteNom]);
  useJsonLd("site", jsonLdSite);

  const candidaturesOuvertes = parametres?.candidatures_ouvertes !== "0";
  const questions = useMemo(
    () => FAQ.filter((q) => !q.enseignant || candidaturesOuvertes),
    [candidaturesOuvertes]
  );
  const jsonLdFaq = useMemo(
    () =>
      etat.statut === "defaut"
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: questions.map((q) => ({
              "@type": "Question",
              name: q.question,
              acceptedAnswer: { "@type": "Answer", text: q.reponse },
            })),
          }
        : null,
    [etat.statut, questions]
  );
  useJsonLd("faq", jsonLdFaq);

  // Ancres (/#faq, /#enseignants, /#newsletter) une fois le contenu affiché
  useEffect(() => {
    if (etat.statut === "chargement" || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [location.hash, etat.statut]);

  const visiteur = !authLoading && !isAuthenticated;

  if (etat.statut === "chargement") {
    return (
      <div className="tely-page min-h-screen">
        <Header />
        <main id="contenu">
          <LandingSkeleton />
        </main>
      </div>
    );
  }

  if (etat.statut === "cms") {
    return (
      <div className="tely-page flex min-h-screen flex-col">
        <GoogleOneTap />
        <Header />
        <main id="contenu" className="flex-1">
          <Suspense fallback={<LandingSkeleton />}>
            <PageRenderer blocs={etat.page.blocs as BlocsRenderer} />
          </Suspense>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="tely-page min-h-screen">
        <GoogleOneTap />
        <Header />

        <main id="contenu">
          <HeroSection ref={finHeroRef} />
          <HowItWorks />
          <BenefitsSection />
          <ExploreSection />
          <RecentExercises />
          {candidaturesOuvertes && <ProfesseurJoinSection />}
          <DerniersArticles />
          <FaqSection questions={questions} />
          <NouvelleLettre />
          <FinalCta />
        </main>

        <Footer />

        {visiteur && (
          <>
            <StickyCta apresRef={finHeroRef} to={cta.to} label={cta.label} />
            {/* Espace réservé pour que le CTA collant ne masque pas le bas du footer */}
            <div className="h-20 bg-gray-900 md:hidden" aria-hidden="true" />
          </>
        )}
      </div>
    </MotionConfig>
  );
}
