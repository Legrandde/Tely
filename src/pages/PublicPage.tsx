import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileQuestionMark, RefreshCw } from "lucide-react";
import Header from "../components/ui/Header";
import FooterSection from "../components/FooterSection";
import LogoLoader from "../components/ui/LogoLoader";
import PageRenderer from "../features/pagebuilder/PageRenderer";
import type { PagePublique } from "../features/pagebuilder/types";
import { getPublicPage, lireErreur } from "../services/pageService";
import { useSeo } from "../hooks/useSeo";

type Etat =
  | { statut: "chargement"; slug: string }
  | { statut: "ok"; slug: string; page: PagePublique }
  | { statut: "introuvable"; slug: string }
  | { statut: "erreur"; slug: string; message: string };

export default function PublicPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [etat, setEtat] = useState<Etat>({ statut: "chargement", slug });
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let annule = false;
    getPublicPage(slug)
      .then((page) => !annule && setEtat({ statut: "ok", slug, page }))
      .catch((e) => {
        if (annule) return;
        const err = lireErreur(e, "La page n'a pas pu être chargée.");
        setEtat(err.status === 404 ? { statut: "introuvable", slug } : { statut: "erreur", slug, message: err.message });
      });
    return () => {
      annule = true;
    };
  }, [slug, essai]);

  // Un changement de slug repasse immédiatement en chargement (sans setState dans l'effet)
  const courant: Etat = etat.slug === slug ? etat : { statut: "chargement", slug };
  const page = courant.statut === "ok" ? courant.page : null;

  useSeo({
    title: page ? page.titre : courant.statut === "introuvable" ? "Page introuvable" : courant.statut === "erreur" ? "Erreur" : "Chargement…",
    description: page?.meta_description ?? undefined,
    image: page?.image_og ?? undefined,
    noindex: courant.statut === "introuvable" || courant.statut === "erreur" ? true : undefined,
  });

  // Remonte en haut lors d'un changement de page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Header />

      <main id="contenu" className="flex-1">
        {courant.statut === "chargement" && <LogoLoader pleinEcran />}

        {courant.statut === "ok" && courant.page && (
          (courant.page.blocs ?? []).length > 0 ? (
            <PageRenderer blocs={courant.page.blocs} />
          ) : (
            <div className="mx-auto max-w-2xl px-4 py-24 text-center">
              <h1 className="tely-title text-3xl">{courant.page.titre}</h1>
              <p className="mt-3 text-gray-500">Cette page sera bientôt complétée.</p>
            </div>
          )
        )}

        {courant.statut === "introuvable" && (
          <section className="relative overflow-hidden bg-amber-50 px-4 py-24 text-center">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
            <div className="relative mx-auto max-w-lg">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-lg shadow-amber-900/5">
                <FileQuestionMark size={30} />
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Erreur 404</p>
              <h1 className="tely-title mt-2 text-3xl sm:text-4xl">Cette page est introuvable</h1>
              <p className="mt-3 text-gray-600">
                La page que vous cherchez n'existe pas, a été déplacée ou n'est pas encore publiée.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/" className="tely-btn">
                  <ArrowLeft size={16} /> Retour à l'accueil
                </Link>
                <Link to="/exercices" className="tely-btn-outline">
                  Explorer les exercices
                </Link>
              </div>
            </div>
          </section>
        )}

        {courant.statut === "erreur" && (
          <section className="px-4 py-24 text-center">
            <h1 className="tely-title text-2xl">Un problème est survenu</h1>
            <p className="mt-2 text-gray-500">{courant.message}</p>
            <button type="button" className="tely-btn mt-6" onClick={() => { setEtat({ statut: "chargement", slug }); setEssai((n) => n + 1); }}>
              <RefreshCw size={16} /> Réessayer
            </button>
          </section>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
