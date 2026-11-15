import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Hash, Newspaper, RefreshCw, Rss, Search, SearchX, Star, X } from "lucide-react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useSeo } from "../../hooks/useSeo";
import { getCategoriesBlog, lireErreur, listArticles, URL_RSS, type ListeArticles } from "../../services/blogService";
import type { ArticleCarte, CategorieBlog, TagBlog } from "../../types/blog";
import ArticleCard, { ArticleCardSkeleton, Couverture } from "../../features/blog/components/ArticleCard";
import { CategorieBadge, MetaArticle } from "../../features/blog/components/Elements";
import CtaBlog from "../../features/blog/components/CtaBlog";
import { styleCouleur, urlArticle, urlCategorie } from "../../features/blog/utils";

const PAR_PAGE = 9;

type EtatListe =
  | { cle: string; statut: "chargement" }
  | { cle: string; statut: "ok"; donnees: ListeArticles }
  | { cle: string; statut: "erreur"; message: string };

/** Ajoute `<link rel="alternate" type="application/rss+xml">` pendant la vie de la page. */
function useLienRss() {
  useEffect(() => {
    const lien = document.createElement("link");
    lien.rel = "alternate";
    lien.type = "application/rss+xml";
    lien.title = "Blog — flux RSS";
    lien.href = URL_RSS;
    document.head.appendChild(lien);
    return () => lien.remove();
  }, []);
}

// ─── Article à la une ─────────────────────────────────────────────────────

function ArticleALaUne({ article }: { article: ArticleCarte }) {
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-amber-500 hover:shadow-xl hover:shadow-gray-900/5 lg:grid-cols-[1.25fr_1fr]">
      <div className="aspect-[16/9] overflow-hidden bg-amber-50 lg:aspect-auto lg:min-h-[360px]">
        <Couverture src={article.image_couverture} eager className="transition-transform duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            <Star size={12} className="fill-amber-400" aria-hidden="true" /> À la une
          </span>
          <CategorieBadge categorie={article.categorie} />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
          <Link to={urlArticle(article.slug)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {article.titre}
          </Link>
        </h2>
        {article.extrait && <p className="mt-3 line-clamp-4 text-base leading-relaxed text-gray-600">{article.extrait}</p>}
        <div className="mt-6">
          <MetaArticle auteur={article.auteur} publieLe={article.publie_le} tempsLecture={article.temps_lecture} />
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:text-amber-700">
          Lire l'article <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function ALaUneSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-gray-100 bg-white lg:grid-cols-[1.25fr_1fr]" aria-hidden="true">
      <div className="aspect-[16/9] animate-pulse bg-gray-100 lg:aspect-auto lg:min-h-[360px]" />
      <div className="space-y-4 p-8">
        <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
        <div className="h-8 w-11/12 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────

function pagesAffichees(courante: number, derniere: number): (number | "…")[] {
  const set = new Set([1, derniere, courante, courante - 1, courante + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= derniere).sort((a, b) => a - b);
  const res: (number | "…")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) res.push("…");
    res.push(p);
  });
  return res;
}

function Pagination({ courante, derniere, lienPage }: { courante: number; derniere: number; lienPage: (p: number) => string }) {
  if (derniere <= 1) return null;
  const btn = "inline-flex h-10 min-w-10 items-center justify-center rounded-[10px] px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-amber-500";
  return (
    <nav aria-label="Pagination des articles" className="mt-12 flex items-center justify-center gap-1.5">
      {courante > 1 ? (
        <Link to={lienPage(courante - 1)} className={`${btn} border border-gray-200 bg-white text-gray-900 hover:bg-gray-50`} aria-label="Page précédente">
          <ChevronLeft size={16} aria-hidden="true" /> <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className={`${btn} border border-gray-100 text-gray-300`} aria-hidden="true">
          <ChevronLeft size={16} />
        </span>
      )}
      {pagesAffichees(courante, derniere).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-gray-400" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            to={lienPage(p)}
            aria-current={p === courante ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`${btn} ${p === courante ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-white"}`}
          >
            {p}
          </Link>
        )
      )}
      {courante < derniere ? (
        <Link to={lienPage(courante + 1)} className={`${btn} border border-gray-200 bg-white text-gray-900 hover:bg-gray-50`} aria-label="Page suivante">
          <span className="hidden sm:inline">Suivant</span> <ChevronRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${btn} border border-gray-100 text-gray-300`} aria-hidden="true">
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function BlogListe() {
  const { slug: categorieSlug = "" } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const tag = (params.get("tag") ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const [categories, setCategories] = useState<CategorieBlog[] | null>(null);
  const [tags, setTags] = useState<TagBlog[]>([]);
  const [essai, setEssai] = useState(0);
  const cle = JSON.stringify([categorieSlug, tag, q, page, essai]);
  const [etat, setEtat] = useState<EtatListe>({ cle, statut: "chargement" });
  const courant: EtatListe = etat.cle === cle ? etat : { cle, statut: "chargement" };
  const haut = useRef<HTMLDivElement>(null);

  // Recherche : saisie locale, synchronisée avec `?q=` (débounce)
  const [saisie, setSaisie] = useState(q);
  const [qVu, setQVu] = useState(q);
  if (q !== qVu) {
    setQVu(q);
    setSaisie(q);
  }

  useEffect(() => {
    if (saisie.trim() === q) return;
    const t = window.setTimeout(() => {
      setParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          if (saisie.trim()) n.set("q", saisie.trim());
          else n.delete("q");
          n.delete("page");
          return n;
        },
        { replace: true }
      );
    }, 350);
    return () => window.clearTimeout(t);
  }, [saisie, q, setParams]);

  // Catégories + nuage de tags (une fois)
  useEffect(() => {
    let annule = false;
    getCategoriesBlog()
      .then((r) => {
        if (annule) return;
        setCategories(r.categories);
        setTags(r.tags);
      })
      .catch(() => !annule && setCategories([]));
    return () => {
      annule = true;
    };
  }, []);

  // Articles
  useEffect(() => {
    const controleur = new AbortController();
    listArticles({ categorie: categorieSlug || undefined, tag: tag || undefined, search: q || undefined, page, per_page: PAR_PAGE }, controleur.signal)
      .then((donnees) => setEtat({ cle, statut: "ok", donnees }))
      .catch((e) => {
        if (controleur.signal.aborted) return;
        setEtat({ cle, statut: "erreur", message: lireErreur(e, "Les articles n'ont pas pu être chargés.").message });
      });
    return () => controleur.abort();
  }, [cle, categorieSlug, tag, q, page]);

  // Remonte en haut de la liste au changement de page
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    haut.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const categorie = categorieSlug ? categories?.find((c) => c.slug === categorieSlug) ?? null : null;
  const categorieInconnue = !!categorieSlug && categories !== null && !categorie;
  const filtre = !!(q || tag);

  useSeo({
    title: categorie ? `${categorie.nom} — Blog` : categorieInconnue ? "Catégorie introuvable" : tag ? `#${tag} — Blog` : "Blog",
    description:
      categorie?.description ||
      "Conseils de révision, méthodes de travail et préparation aux examens (Brevet, BAC) : les articles du blog pour progresser à votre rythme.",
    noindex: categorieInconnue || !!q || page > 1 ? true : undefined,
  });
  useLienRss();

  const donnees = courant.statut === "ok" ? courant.donnees : null;
  const aLaUne = donnees?.a_la_une ?? null;
  const articles = useMemo(
    () => (donnees?.articles.data ?? []).filter((a) => !aLaUne || a.id !== aLaUne.id),
    [donnees, aLaUne]
  );
  const total = donnees?.articles.total ?? 0;
  const dernierePage = donnees?.articles.last_page ?? 1;

  const base = categorieSlug ? urlCategorie(categorieSlug) : "/blog";
  const lienAvec = (modif: Record<string, string | null>) => {
    const n = new URLSearchParams(params);
    Object.entries(modif).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    const s = n.toString();
    return `${base}${s ? `?${s}` : ""}`;
  };
  const lienPage = (p: number) => lienAvec({ page: p > 1 ? String(p) : null });

  const titre = categorie ? categorie.nom : "Le blog";
  const sousTitre = categorie
    ? categorie.description || `Tous nos articles de la catégorie « ${categorie.nom} ».`
    : "Méthodes de révision, conseils d'examen et actualités : tout pour apprendre mieux et réussir vos examens.";

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <div className="bg-amber-50">
        <Header />
      </div>

      <main id="contenu" className="flex-1">
        {/* ── En-tête ───────────────────────────────────────────────── */}
        <section aria-labelledby="blog-titre" className="relative overflow-hidden bg-amber-50 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl">
            {categorie && (
              <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-gray-500">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link to="/blog" className="hover:text-gray-900 hover:underline">
                      Blog
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="font-semibold text-gray-900">
                    {categorie.nom}
                  </li>
                </ol>
              </nav>
            )}
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">{categorie ? "Catégorie" : "Ressources & conseils"}</p>
                <h1 id="blog-titre" className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                  {titre}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-gray-600 sm:text-lg">{sousTitre}</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
                <form
                  role="search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setParams((prev) => {
                      const n = new URLSearchParams(prev);
                      if (saisie.trim()) n.set("q", saisie.trim());
                      else n.delete("q");
                      n.delete("page");
                      return n;
                    });
                  }}
                  className="flex w-full items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-3.5 shadow-sm transition-all focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)] sm:w-80"
                >
                  <Search size={17} className="shrink-0 text-gray-400" aria-hidden="true" />
                  <label htmlFor="blog-recherche" className="sr-only">
                    Rechercher un article
                  </label>
                  <input
                    id="blog-recherche"
                    type="search"
                    value={saisie}
                    maxLength={100}
                    onChange={(e) => setSaisie(e.target.value)}
                    placeholder="Rechercher un article…"
                    className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </form>
                <a
                  href={URL_RSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[12px] border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-amber-500"
                  title="S'abonner au flux RSS"
                >
                  <Rss size={16} className="text-orange-500" aria-hidden="true" /> RSS
                </a>
              </div>
            </div>

            {/* Catégories */}
            {categories && categories.length > 0 && (
              <nav aria-label="Catégories du blog" className="-mx-4 mt-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                  <li>
                    <Link
                      to="/blog"
                      aria-current={!categorieSlug ? "page" : undefined}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                        !categorieSlug ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-900"
                      }`}
                    >
                      Tous les articles
                    </Link>
                  </li>
                  {categories.map((c) => {
                    const s = styleCouleur(c.couleur);
                    const actif = c.slug === categorieSlug;
                    return (
                      <li key={c.id}>
                        <Link
                          to={urlCategorie(c.slug)}
                          aria-current={actif ? "page" : undefined}
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                            actif ? s.actif : s.chip
                          }`}
                        >
                          {!actif && <span className={`h-2 w-2 rounded-full ${s.point}`} aria-hidden="true" />}
                          {c.nom}
                          <span className={`text-xs font-medium ${actif ? "opacity-80" : "opacity-60"}`}>{c.articles_count}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </section>

        <div ref={haut} className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Filtres actifs */}
            {filtre && courant.statut !== "chargement" && !categorieInconnue && (
              <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600" aria-live="polite">
                <span>
                  <span className="font-semibold text-gray-900">{total}</span> article{total > 1 ? "s" : ""}
                  {q && (
                    <>
                      {" "}
                      pour « <span className="font-semibold text-gray-900">{q}</span> »
                    </>
                  )}
                </span>
                {tag && (
                  <Link to={lienAvec({ tag: null, page: null })} className="tely-chip bg-gray-900 text-white hover:bg-gray-700" aria-label={`Retirer le filtre #${tag}`}>
                    <Hash size={11} aria-hidden="true" /> {tag} <X size={12} aria-hidden="true" />
                  </Link>
                )}
                <Link to={base} className="tely-link text-xs">
                  Effacer les filtres
                </Link>
              </div>
            )}

            {categorieInconnue ? (
              <div className="mx-auto max-w-md py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <SearchX size={26} aria-hidden="true" />
                </span>
                <h2 className="tely-title mt-4 text-2xl">Catégorie introuvable</h2>
                <p className="mt-2 text-gray-500">Cette catégorie n'existe pas ou a été supprimée.</p>
                <Link to="/blog" className="tely-btn mt-6">
                  Voir tous les articles
                </Link>
              </div>
            ) : courant.statut === "chargement" ? (
              <div aria-busy="true" aria-label="Chargement des articles">
                {!filtre && !categorieSlug && page === 1 && (
                  <div className="mb-10">
                    <ALaUneSkeleton />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : courant.statut === "erreur" ? (
              <div role="alert" className="mx-auto max-w-md py-16 text-center">
                <h2 className="tely-title text-2xl">Un problème est survenu</h2>
                <p className="mt-2 text-gray-500">{courant.message}</p>
                <button type="button" className="tely-btn mt-6" onClick={() => setEssai((n) => n + 1)}>
                  <RefreshCw size={16} aria-hidden="true" /> Réessayer
                </button>
              </div>
            ) : articles.length === 0 && !aLaUne ? (
              <div className="mx-auto max-w-md py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Newspaper size={26} aria-hidden="true" />
                </span>
                <h2 className="tely-title mt-4 text-2xl">{filtre ? "Aucun article ne correspond" : "Aucun article pour le moment"}</h2>
                <p className="mt-2 text-gray-500">
                  {filtre ? "Essayez avec d'autres mots-clés ou retirez un filtre." : "Nos premiers articles arrivent très bientôt. Revenez vite !"}
                </p>
                {filtre ? (
                  <Link to={base} className="tely-btn mt-6">
                    Effacer les filtres
                  </Link>
                ) : (
                  <Link to="/exercices" className="tely-btn mt-6">
                    Explorer les exercices <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
            ) : (
              <>
                {aLaUne && (
                  <div className="mb-12">
                    <ArticleALaUne article={aLaUne} />
                  </div>
                )}
                {articles.length > 0 && (
                  <>
                    <h2 className="sr-only">{categorie ? `Articles : ${categorie.nom}` : "Derniers articles"}</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {articles.map((a) => (
                        <ArticleCard key={a.id} article={a} />
                      ))}
                    </div>
                  </>
                )}
                <Pagination courante={donnees?.articles.current_page ?? page} derniere={dernierePage} lienPage={lienPage} />
              </>
            )}

            {/* Nuage de tags */}
            {tags.length > 0 && !categorieInconnue && (
              <section aria-labelledby="blog-tags" className="mt-16 border-t border-gray-100 pt-10">
                <h2 id="blog-tags" className="text-sm font-bold uppercase tracking-[0.12em] text-gray-500">
                  Sujets populaires
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const actif = t.tag === tag;
                    return (
                      <li key={t.tag}>
                        <Link
                          to={lienAvec({ tag: actif ? null : t.tag, page: null })}
                          aria-current={actif ? "true" : undefined}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                            actif ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-gray-900"
                          }`}
                        >
                          <Hash size={13} className="opacity-60" aria-hidden="true" />
                          {t.tag}
                          <span className="text-xs opacity-60">{t.total}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <div className="mt-16">
              <CtaBlog variante="bandeau" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
