import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileQuestionMark, Hash, RefreshCw } from "lucide-react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import PageRenderer from "@/features/pagebuilder/PageRenderer";
import { useJsonLd, useSeo } from "@/hooks/useSeo";
import { useSiteNom } from "@/context/SiteContext";
import { getArticle, lireErreur } from "@/services/blogService";
import type { Article, ArticleCarte } from "@/types/blog";
import { resolveImageUrl } from "@/utils/imageUrl";
import ArticleEntete from "@/features/blog/components/ArticleEntete";
import ArticleCard from "@/features/blog/components/ArticleCard";
import PartageArticle from "@/features/blog/components/PartageArticle";
import BarreProgression from "@/features/blog/components/BarreProgression";
import CtaBlog from "@/features/blog/components/CtaBlog";
import { AvatarAuteur } from "@/features/blog/components/Elements";
import { nomAuteur, urlCategorie, urlTag } from "@/features/blog/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div aria-busy="true" aria-label="Chargement de l'article" className="px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="relative min-h-[380px] sm:min-h-[480px] w-full overflow-hidden rounded-xl bg-muted">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-x-0 bottom-0 max-w-2xl space-y-3 p-6 sm:p-10">
            <Skeleton className="h-9 w-5/6 bg-foreground/15" />
            <Skeleton className="h-9 w-2/3 bg-foreground/15" />
            <Skeleton className="h-4 w-1/2 bg-foreground/10" />
            <Skeleton className="h-4 w-full bg-foreground/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-3 py-14">
        {[100, 95, 98, 80, 92, 60].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
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
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {article && <BarreProgression cible={corps} />}
      <Header />

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
                  <nav aria-label="Fil d'Ariane" className="mb-4 text-xs sm:text-sm text-muted-foreground">
                    <ol className="flex flex-wrap items-center gap-1.5">
                      <li>
                        <Link to="/" className="hover:text-foreground transition-colors">
                          Accueil
                        </Link>
                      </li>
                      <li aria-hidden="true">/</li>
                      <li>
                        <Link to="/blog" className="hover:text-foreground transition-colors">
                          Blog
                        </Link>
                      </li>
                      {article.categorie && (
                        <>
                          <li aria-hidden="true">/</li>
                          <li>
                            <Link
                              to={urlCategorie(article.categorie.slug)}
                              className="hover:text-foreground transition-colors"
                            >
                              {article.categorie.nom}
                            </Link>
                          </li>
                        </>
                      )}
                      <li aria-hidden="true" className="hidden sm:inline">/</li>
                      <li aria-current="page" className="hidden max-w-[18rem] truncate font-medium text-foreground sm:inline">
                        {article.titre}
                      </li>
                    </ol>
                  </nav>
                }
              />

              {/* Contenu de l'article */}
              <div className="py-4">
                {(article.blocs ?? []).length > 0 ? (
                  <PageRenderer blocs={article.blocs} />
                ) : (
                  <p className="mx-auto max-w-3xl px-4 py-14 text-muted-foreground">
                    Le contenu de cet article sera bientôt disponible.
                  </p>
                )}
              </div>

              {/* Tags, auteur et partage */}
              <footer className="mx-auto max-w-3xl space-y-6 px-4 pb-8 pt-4 sm:px-6">
                {article.tags && article.tags.length > 0 && (
                  <div>
                    <h2 className="sr-only">Mots-clés</h2>
                    <ul className="flex flex-wrap gap-2">
                      {article.tags.map((t) => (
                        <li key={t}>
                          <Link to={urlTag(t)}>
                            <Badge variant="secondary" className="px-3 py-1 text-xs hover:bg-secondary/70">
                              <Hash className="size-3 opacity-60" aria-hidden="true" />
                              {t}
                            </Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarAuteur auteur={article.auteur} taille="h-11 w-11" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Écrit par
                      </p>
                      <p className="text-sm font-semibold text-foreground">{nomAuteur(article.auteur)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-right">
                      Partager
                    </p>
                    <PartageArticle url={urlPartage} titre={article.titre} />
                  </div>
                </div>
              </footer>
            </article>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <CtaBlog variante="fin" />
            </div>

            {courant.similaires.length > 0 && (
              <section
                aria-labelledby="similaires-titre"
                className="border-t border-border bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
              >
                <div className="mx-auto max-w-7xl">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="tely-overline text-amber-600">Continuer la lecture</p>
                      <h2 id="similaires-titre" className="tely-title mt-1.5 text-2xl sm:text-3xl">
                        Articles similaires
                      </h2>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/blog">
                        Tous les articles <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
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
          <section className="relative overflow-hidden px-4 py-24 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
            />
            <div className="relative mx-auto max-w-lg">
              <span className="mx-auto flex size-14 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs">
                <FileQuestionMark className="size-7 text-amber-500" aria-hidden="true" />
              </span>
              <p className="mt-6 tely-overline text-amber-600">Erreur 404</p>
              <h1 className="tely-title mt-2 text-3xl sm:text-4xl">Cet article est introuvable</h1>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                L'article que vous cherchez n'existe pas, a été retiré ou n'est pas encore publié.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/blog">
                    <ArrowLeft className="size-4" aria-hidden="true" /> Retour au blog
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/exercices">Explorer les exercices</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {courant.statut === "erreur" && (
          <section role="alert" className="px-4 py-24 text-center">
            <h1 className="tely-title text-2xl">Un problème est survenu</h1>
            <p className="mt-2 text-sm text-muted-foreground">{courant.message}</p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                setEtat({ statut: "chargement", slug });
                setEssai((n) => n + 1);
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Réessayer
            </Button>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
