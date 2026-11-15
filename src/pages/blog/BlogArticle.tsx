import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileQuestionMark, Hash, RefreshCw } from "lucide-react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import PageRenderer from "../../features/pagebuilder/PageRenderer";
import { useJsonLd, useSeo } from "../../hooks/useSeo";
import { useSiteNom } from "../../context/SiteContext";
import { getArticle, lireErreur } from "../../services/blogService";
import type { Article, ArticleCarte } from "../../types/blog";
import { resolveImageUrl } from "../../utils/imageUrl";
import ArticleEntete from "../../features/blog/components/ArticleEntete";
import ArticleCard from "../../features/blog/components/ArticleCard";
import PartageArticle from "../../features/blog/components/PartageArticle";
import BarreProgression from "../../features/blog/components/BarreProgression";
import CtaBlog from "../../features/blog/components/CtaBlog";
import { AvatarAuteur } from "../../features/blog/components/Elements";
import { nomAuteur, urlCategorie, urlTag } from "../../features/blog/utils";

type Etat =
  | { statut: "chargement"; slug: string }
  | { statut: "ok"; slug: string; article: Article; similaires: ArticleCarte[] }
  | { statut: "introuvable"; slug: string }
  | { statut: "erreur"; slug: string; message: string };

function urlAbsolue(chemin: string | null | undefined): string | undefined {
  const r = resolveImageUrl(chemin);
  if (!r) return undefined;
  return /^https?:\/\//i.test(r) ? r : `${window.location.origin}${r}`;
}

function Squelette() {
  return (
    <div aria-busy="true" aria-label="Chargement de l'article" className="animate-pulse">
      <div className="bg-amber-50 px-4 pb-24 pt-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-4 w-40 rounded bg-amber-100" />
          <div className="h-6 w-24 rounded-full bg-amber-100" />
          <div className="h-10 w-full rounded-xl bg-amber-100" />
          <div className="h-10 w-3/4 rounded-xl bg-amber-100" />
          <div className="h-5 w-2/3 rounded bg-amber-100/70" />
          <div className="flex items-center gap-3 pt-2">
            <div className="h-8 w-8 rounded-full bg-amber-100" />
            <div className="h-4 w-48 rounded bg-amber-100" />
          </div>
        </div>
      </div>
      <div className="-mt-16 px-4">
        <div className="mx-auto aspect-[16/9] max-w-5xl rounded-2xl bg-gray-100" />
      </div>
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-14">
        {[100, 95, 98, 80, 92, 60].map((w, i) => (
          <div key={i} className="h-4 rounded bg-gray-100" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const siteNom = useSiteNom();
  const [etat, setEtat] = useState<Etat>({ statut: "chargement", slug });
  const [essai, setEssai] = useState(0);
  const corps = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let annule = false;
    getArticle(slug)
      .then(({ article, similaires }) => !annule && setEtat({ statut: "ok", slug, article, similaires }))
      .catch((e) => {
        if (annule) return;
        const err = lireErreur(e, "L'article n'a pas pu être chargé.");
        setEtat(err.status === 404 ? { statut: "introuvable", slug } : { statut: "erreur", slug, message: err.message });
      });
    return () => {
      annule = true;
    };
  }, [slug, essai]);

  // Un changement de slug repasse immédiatement en chargement
  const courant: Etat = etat.slug === slug ? etat : { statut: "chargement", slug };
  const article = courant.statut === "ok" ? courant.article : null;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  useSeo({
    title: article ? article.titre : courant.statut === "introuvable" ? "Article introuvable" : courant.statut === "erreur" ? "Erreur" : "Chargement…",
    description: article ? article.meta_description || article.extrait : undefined,
    image: article?.image_couverture ?? undefined,
    type: article ? "article" : "website",
    noindex: courant.statut === "introuvable" || courant.statut === "erreur" ? true : undefined,
  });

  const jsonLd = useMemo(() => {
    if (!article) return null;
    const origine = window.location.origin;
    const url = `${origine}/blog/${article.slug}`;
    const image = urlAbsolue(article.image_couverture);
    const modifie = (article as Article & { updated_at?: string }).updated_at;
    const posting: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: article.titre.slice(0, 110),
      description: article.meta_description || article.extrait || undefined,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: "fr",
      datePublished: article.publie_le ?? undefined,
      dateModified: modifie ?? article.publie_le ?? undefined,
      author: { "@type": "Person", name: nomAuteur(article.auteur) },
      publisher: { "@type": "Organization", name: siteNom, logo: { "@type": "ImageObject", url: `${origine}/favicon.svg` } },
      timeRequired: `PT${Math.max(1, article.temps_lecture || 1)}M`,
    };
    if (image) posting.image = [image];
    if (article.categorie) posting.articleSection = article.categorie.nom;
    if (article.tags?.length) posting.keywords = article.tags.join(", ");

    const fil = [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${origine}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origine}/blog` },
      ...(article.categorie
        ? [{ "@type": "ListItem", position: 3, name: article.categorie.nom, item: `${origine}${urlCategorie(article.categorie.slug)}` }]
        : []),
      { "@type": "ListItem", position: article.categorie ? 4 : 3, name: article.titre, item: url },
    ];
    return { "@context": "https://schema.org", "@graph": [posting, { "@type": "BreadcrumbList", itemListElement: fil }] };
  }, [article, siteNom]);
  useJsonLd("article", jsonLd);

  const urlPartage = article ? `${window.location.origin}/blog/${article.slug}` : "";

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {article && <BarreProgression cible={corps} />}
      <div className="bg-amber-50">
        <Header />
      </div>

      <main id="contenu" className="flex-1">
        {courant.statut === "chargement" && <Squelette />}

        {courant.statut === "ok" && article && (
          <>
            <article ref={corps} className="@container" aria-labelledby="article-titre">
                <ArticleEntete
                  idTitre="article-titre"
                  titre={article.titre}
                  extrait={article.extrait}
                  categorie={article.categorie}
                  auteur={article.auteur}
                  publieLe={article.publie_le}
                  tempsLecture={article.temps_lecture}
                  couverture={article.image_couverture}
                  avant={
                    <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-gray-500">
                      <ol className="flex flex-wrap items-center gap-1.5">
                        <li>
                          <Link to="/" className="hover:text-gray-900 hover:underline">
                            Accueil
                          </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                          <Link to="/blog" className="hover:text-gray-900 hover:underline">
                            Blog
                          </Link>
                        </li>
                        {article.categorie && (
                          <>
                            <li aria-hidden="true">/</li>
                            <li>
                              <Link to={urlCategorie(article.categorie.slug)} className="hover:text-gray-900 hover:underline">
                                {article.categorie.nom}
                              </Link>
                            </li>
                          </>
                        )}
                        <li aria-hidden="true" className="hidden sm:inline">
                          /
                        </li>
                        <li aria-current="page" className="hidden max-w-[16rem] truncate font-medium text-gray-700 sm:inline">
                          {article.titre}
                        </li>
                      </ol>
                    </nav>
                  }
                />

              {(article.blocs ?? []).length > 0 ? (
                <PageRenderer blocs={article.blocs} />
              ) : (
                <p className="mx-auto max-w-3xl px-4 py-14 text-gray-500">Le contenu de cet article sera bientôt disponible.</p>
              )}

              {/* Tags, partage, auteur */}
              <footer className="mx-auto max-w-3xl space-y-8 px-4 pb-4 pt-4 @3xl:px-8">
                {article.tags && article.tags.length > 0 && (
                  <div>
                    <h2 className="sr-only">Mots-clés</h2>
                    <ul className="flex flex-wrap gap-2">
                      {article.tags.map((t) => (
                        <li key={t}>
                          <Link
                            to={urlTag(t)}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-amber-500"
                          >
                            <Hash size={13} className="opacity-60" aria-hidden="true" /> {t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-4 border-y border-gray-100 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarAuteur auteur={article.auteur} taille="h-12 w-12" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Écrit par</p>
                      <p className="font-bold text-gray-900">{nomAuteur(article.auteur)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 sm:text-right">Partager</p>
                    <PartageArticle url={urlPartage} titre={article.titre} />
                  </div>
                </div>
              </footer>
            </article>

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
              <CtaBlog variante="fin" />
            </div>

            {courant.similaires.length > 0 && (
              <section aria-labelledby="similaires-titre" className="bg-amber-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">Continuer la lecture</p>
                      <h2 id="similaires-titre" className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Articles similaires
                      </h2>
                    </div>
                    <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-amber-700">
                      Tous les articles <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courant.similaires.map((a) => (
                      <ArticleCard key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {courant.statut === "introuvable" && (
          <section className="relative overflow-hidden bg-amber-50 px-4 py-24 text-center">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
            <div className="relative mx-auto max-w-lg">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-lg shadow-amber-900/5">
                <FileQuestionMark size={30} aria-hidden="true" />
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Erreur 404</p>
              <h1 className="tely-title mt-2 text-3xl sm:text-4xl">Cet article est introuvable</h1>
              <p className="mt-3 text-gray-600">L'article que vous cherchez n'existe pas, a été retiré ou n'est pas encore publié.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/blog" className="tely-btn">
                  <ArrowLeft size={16} aria-hidden="true" /> Retour au blog
                </Link>
                <Link to="/exercices" className="tely-btn-outline">
                  Explorer les exercices
                </Link>
              </div>
            </div>
          </section>
        )}

        {courant.statut === "erreur" && (
          <section role="alert" className="px-4 py-24 text-center">
            <h1 className="tely-title text-2xl">Un problème est survenu</h1>
            <p className="mt-2 text-gray-500">{courant.message}</p>
            <button
              type="button"
              className="tely-btn mt-6"
              onClick={() => {
                setEtat({ statut: "chargement", slug });
                setEssai((n) => n + 1);
              }}
            >
              <RefreshCw size={16} aria-hidden="true" /> Réessayer
            </button>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
