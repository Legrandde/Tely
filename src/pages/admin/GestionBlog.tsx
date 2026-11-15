import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  ExternalLink,
  FolderOpen,
  LoaderCircle,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import Dialogue from "../../features/pagebuilder/editor/Dialogue";
import { creerBloc } from "../../features/pagebuilder/registry";
import {
  createArticle,
  createCategorieBlog,
  deleteArticle,
  deleteCategorieBlog,
  duplicateArticle,
  getCategoriesBlog,
  lireErreur,
  listArticlesAdmin,
  updateCategorieBlog,
} from "../../services/blogService";
import type {
  ArticleAdminResume,
  CategorieBlog,
  CompteursArticles,
  CouleurCategorie,
  FiltreStatutArticle,
  Pagination,
} from "../../types/blog";
import { resolveImageUrl } from "../../utils/imageUrl";
import { BadgeStatut, CategorieBadge } from "../../features/blog/components/Elements";
import { COULEURS_CATEGORIE, dateCourte, LISTE_COULEURS, styleCouleur, urlArticle } from "../../features/blog/utils";

type Onglet = "articles" | "categories";

/** Crée un brouillon prêt à éditer (slug unique pour éviter les collisions). */
async function creerBrouillon() {
  return createArticle({
    titre: "Nouvel article",
    slug: `nouvel-article-${Date.now().toString(36)}`,
    statut: "brouillon",
    blocs: [creerBloc("texte", { titre: "Introduction", contenu: "Rédigez ici l'introduction de votre article…" })],
  });
}

function Miniature({ src }: { src: string | null }) {
  const url = resolveImageUrl(src);
  return url ? (
    <img src={url} alt="" loading="lazy" className="h-12 w-20 shrink-0 rounded-lg object-cover ring-1 ring-gray-900/5" />
  ) : (
    <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500" aria-hidden="true">
      <Newspaper size={18} />
    </span>
  );
}

// ─── Onglet Articles ──────────────────────────────────────────────────────

function OngletArticles({ categories, onNouveau, creation }: { categories: CategorieBlog[]; onNouveau: () => void; creation: boolean }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [statut, setStatut] = useState<FiltreStatutArticle>("");
  const [recherche, setRecherche] = useState("");
  const [rechercheDiff, setRechercheDiff] = useState("");
  const [categorieId, setCategorieId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [rafraichir, setRafraichir] = useState(0);

  const cle = JSON.stringify([statut, rechercheDiff, categorieId, page, rafraichir]);
  const [resultat, setResultat] = useState<{ cle: string; articles: Pagination<ArticleAdminResume> } | null>(null);
  const [erreur, setErreur] = useState<{ cle: string; message: string } | null>(null);
  const [counts, setCounts] = useState<CompteursArticles | null>(null);
  const chargement = resultat?.cle !== cle && erreur?.cle !== cle;

  const [aSupprimer, setASupprimer] = useState<ArticleAdminResume | null>(null);
  const [suppression, setSuppression] = useState(false);
  const [duplication, setDuplication] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setRechercheDiff(recherche);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [recherche]);

  useEffect(() => {
    let annule = false;
    listArticlesAdmin({ statut, search: rechercheDiff, categorie_blog_id: categorieId, page })
      .then((r) => {
        if (annule) return;
        setResultat({ cle, articles: r.articles });
        setCounts(r.counts);
        setErreur(null);
      })
      .catch((e) => !annule && setErreur({ cle, message: lireErreur(e, "Impossible de charger les articles.").message }));
    return () => {
      annule = true;
    };
  }, [cle, statut, rechercheDiff, categorieId, page]);

  const articles = resultat?.articles.data ?? [];
  const derniere = resultat?.articles.last_page ?? 1;
  const filtreActif = !!(statut || rechercheDiff || categorieId);

  async function dupliquer(a: ArticleAdminResume) {
    setDuplication(a.id);
    try {
      const copie = await duplicateArticle(a.id);
      toast.success(`Article dupliqué : « ${copie.titre} » (brouillon).`);
      setRafraichir((n) => n + 1);
    } catch (e) {
      toast.error(lireErreur(e, "La duplication a échoué.").message);
    } finally {
      setDuplication(null);
    }
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return;
    setSuppression(true);
    try {
      await deleteArticle(aSupprimer.id);
      toast.success(`L'article « ${aSupprimer.titre} » a été supprimé.`);
      setASupprimer(null);
      setRafraichir((n) => n + 1);
    } catch (e) {
      toast.error(lireErreur(e, "Suppression impossible.").message);
    } finally {
      setSuppression(false);
    }
  }

  const filtres: { valeur: FiltreStatutArticle; libelle: string; total?: number }[] = [
    { valeur: "", libelle: "Tous", total: counts?.tous },
    { valeur: "publie", libelle: "Publiés", total: counts?.publie },
    { valeur: "programme", libelle: "Programmés", total: counts?.programme },
    { valeur: "brouillon", libelle: "Brouillons", total: counts?.brouillon },
  ];

  const actions = (a: ArticleAdminResume, compact = false) => {
    const visible = a.statut === "publie" && !a.est_programme;
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={() => navigate(`/blog-editor/${a.id}`)} className={`tely-btn-outline px-3 py-2 text-xs ${compact ? "" : "hidden lg:inline-flex"}`}>
          <Pencil size={14} /> Éditer
        </button>
        {!compact && (
          <button type="button" onClick={() => navigate(`/blog-editor/${a.id}`)} className="tely-icon-btn lg:hidden" aria-label={`Éditer ${a.titre}`} title="Éditer">
            <Pencil size={16} />
          </button>
        )}
        {visible ? (
          <a href={urlArticle(a.slug)} target="_blank" rel="noopener noreferrer" className="tely-icon-btn" title="Voir l'article" aria-label={`Voir ${a.titre} dans un nouvel onglet`}>
            <ExternalLink size={16} />
          </a>
        ) : (
          <span className="tely-icon-btn cursor-not-allowed opacity-30" title="L'article n'est pas encore visible sur le site" aria-hidden="true">
            <ExternalLink size={16} />
          </span>
        )}
        <button type="button" onClick={() => void dupliquer(a)} disabled={duplication === a.id} className="tely-icon-btn" title="Dupliquer" aria-label={`Dupliquer ${a.titre}`}>
          {duplication === a.id ? <LoaderCircle size={16} className="animate-spin" /> : <Copy size={16} />}
        </button>
        <button type="button" onClick={() => setASupprimer(a)} className="tely-icon-btn hover:bg-red-50 hover:text-red-600" title="Supprimer" aria-label={`Supprimer ${a.titre}`}>
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compteurs / filtre de statut */}
      <div role="radiogroup" aria-label="Filtrer par statut" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {filtres.map((f) => {
          const actif = statut === f.valeur;
          return (
            <button
              key={f.valeur || "tous"}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => {
                setStatut(f.valeur);
                setPage(1);
              }}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all ${
                actif ? "border-gray-900 bg-gray-900 text-white shadow-sm" : "border-gray-100 bg-white text-gray-900 hover:border-gray-300"
              }`}
            >
              <span className={`block text-xs font-semibold ${actif ? "text-gray-300" : "text-gray-500"}`}>{f.libelle}</span>
              <span className="mt-0.5 block text-2xl font-bold tabular-nums">{f.total ?? "—"}</span>
            </button>
          );
        })}
      </div>

      {/* Barre d'outils */}
      <div className="tely-card flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex w-full flex-1 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]">
          <Search size={16} className="shrink-0 text-gray-900" aria-hidden="true" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article par titre…"
            aria-label="Rechercher un article"
            className="w-full flex-1 border-none bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
        <select
          value={categorieId}
          onChange={(e) => {
            setCategorieId(e.target.value ? Number(e.target.value) : "");
            setPage(1);
          }}
          aria-label="Filtrer par catégorie"
          className="tely-input py-3 md:w-56"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Contenu */}
      {chargement && !resultat ? (
        <div className="tely-card divide-y divide-gray-100" aria-busy="true" aria-label="Chargement des articles">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-12 w-20 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-56 max-w-full rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-100" />
              </div>
              <div className="hidden h-5 w-20 rounded-full bg-gray-100 md:block" />
              <div className="h-8 w-24 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      ) : erreur?.cle === cle ? (
        <div role="alert" className="tely-card py-16 text-center text-sm text-red-500">
          {erreur.message}
          <button type="button" className="tely-link ml-2" onClick={() => setRafraichir((n) => n + 1)}>
            Réessayer
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="tely-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Newspaper size={22} className="text-amber-700" />
          </div>
          <p className="text-sm font-medium text-gray-700">{filtreActif ? "Aucun article ne correspond" : "Aucun article pour l'instant"}</p>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            {filtreActif ? "Modifiez la recherche ou les filtres." : "Rédigez votre premier article : il attirera de nouveaux élèves grâce au référencement."}
          </p>
          {!filtreActif && (
            <button type="button" className="tely-btn mt-5" onClick={onNouveau} disabled={creation}>
              {creation ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} Écrire un article
            </button>
          )}
        </div>
      ) : (
        <div className={`transition-opacity ${chargement ? "pointer-events-none opacity-60" : ""}`} aria-busy={chargement}>
          {/* Tableau (≥ md) */}
          <div className="tely-card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Articles du blog</caption>
              <thead className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Article</th>
                  <th scope="col" className="px-3 py-3">Catégorie</th>
                  <th scope="col" className="px-3 py-3">Statut</th>
                  <th scope="col" className="px-3 py-3 text-right">Vues</th>
                  <th scope="col" className="px-3 py-3">Mis à jour</th>
                  <th scope="col" className="px-5 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Miniature src={a.image_couverture} />
                        <div className="min-w-0 max-w-sm">
                          <Link to={`/blog-editor/${a.id}`} className="line-clamp-2 font-bold text-gray-900 hover:underline">
                            {a.mis_en_avant && (
                              <Star size={13} className="mr-1 inline fill-amber-400 align-[-2px] text-amber-500" aria-label="À la une" />
                            )}
                            {a.titre}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-gray-400">/blog/{a.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{a.categorie ? <CategorieBadge categorie={a.categorie} lien={false} /> : <span className="text-xs text-gray-400">—</span>}</td>
                    <td className="px-3 py-3">
                      <BadgeStatut article={a} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">{a.vues.toLocaleString("fr-FR")}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">{dateCourte(a.updated_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">{actions(a)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes (mobile) */}
          <ul className="space-y-3 md:hidden">
            {articles.map((a) => (
              <li key={a.id} className="tely-card p-4">
                <div className="flex gap-3">
                  <Miniature src={a.image_couverture} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/blog-editor/${a.id}`} className="line-clamp-2 text-sm font-bold text-gray-900">
                      {a.mis_en_avant && <Star size={13} className="mr-1 inline fill-amber-400 align-[-2px] text-amber-500" aria-label="À la une" />}
                      {a.titre}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <BadgeStatut article={a} />
                      {a.categorie && <CategorieBadge categorie={a.categorie} lien={false} />}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} aria-hidden="true" /> {a.vues.toLocaleString("fr-FR")}
                    </span>
                    <span>{dateCourte(a.updated_at)}</span>
                  </span>
                  {actions(a, true)}
                </div>
              </li>
            ))}
          </ul>

          {derniere > 1 && (
            <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-900">{page}</span> sur {derniere} · {resultat?.articles.total ?? 0} article(s)
              </p>
              <div className="flex gap-1">
                <button type="button" className="tely-btn-outline px-3 py-2 text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Page précédente">
                  <ChevronLeft size={15} /> <span className="hidden sm:inline">Précédente</span>
                </button>
                <button type="button" className="tely-btn-outline px-3 py-2 text-xs" disabled={page >= derniere} onClick={() => setPage((p) => p + 1)} aria-label="Page suivante">
                  <span className="hidden sm:inline">Suivante</span> <ChevronRight size={15} />
                </button>
              </div>
            </nav>
          )}
        </div>
      )}

      <ConfirmModal
        open={aSupprimer !== null}
        title="Supprimer cet article ?"
        description={
          aSupprimer
            ? `« ${aSupprimer.titre} » sera supprimé${aSupprimer.statut === "publie" ? " et ne sera plus accessible sur le blog" : ""}. Cette action est irréversible.`
            : undefined
        }
        loading={suppression}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
        variant="danger"
        onCancel={() => setASupprimer(null)}
        onConfirm={() => void confirmerSuppression()}
      />
    </div>
  );
}

// ─── Onglet Catégories ────────────────────────────────────────────────────

interface FormCategorie {
  nom: string;
  description: string;
  couleur: CouleurCategorie;
  ordre: string;
}

function CategorieModal({
  categorie,
  ouvert,
  onFermer,
  onEnregistre,
}: {
  categorie: CategorieBlog | null;
  ouvert: boolean;
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const toast = useToast();
  const id = useId();
  const [form, setForm] = useState<FormCategorie>(() => ({
    nom: categorie?.nom ?? "",
    description: categorie?.description ?? "",
    couleur: categorie?.couleur ?? "amber",
    ordre: String(categorie?.ordre ?? 0),
  }));
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});
  const [envoi, setEnvoi] = useState(false);

  async function enregistrer() {
    if (!form.nom.trim()) {
      setErreurs({ nom: ["Le nom est obligatoire."] });
      return;
    }
    const ordre = Number.parseInt(form.ordre, 10);
    setEnvoi(true);
    setErreurs({});
    const donnees = {
      nom: form.nom.trim(),
      description: form.description.trim() || null,
      couleur: form.couleur,
      ordre: Number.isFinite(ordre) ? Math.min(999, Math.max(0, ordre)) : 0,
    };
    try {
      if (categorie) await updateCategorieBlog(categorie.id, donnees);
      else await createCategorieBlog(donnees);
      toast.success(categorie ? "Catégorie mise à jour." : "Catégorie créée.");
      onEnregistre();
    } catch (e) {
      const err = lireErreur(e, "L'enregistrement de la catégorie a échoué.");
      if (err.status === 422) setErreurs(err.errors);
      else toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  const nbDescription = [...form.description].length;

  return (
    <Dialogue
      ouvert={ouvert}
      onFermer={onFermer}
      titre={categorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
      sousTitre="Les catégories organisent le blog et disposent de leur propre page."
      largeur="max-w-lg"
      pied={
        <>
          <button type="button" className="tely-btn-outline py-2.5" onClick={onFermer} disabled={envoi}>
            Annuler
          </button>
          <button type="button" className="tely-btn py-2.5" onClick={() => void enregistrer()} disabled={envoi}>
            {envoi && <LoaderCircle size={16} className="animate-spin" />}
            {categorie ? "Enregistrer" : "Créer la catégorie"}
          </button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void enregistrer();
        }}
      >
        <div>
          <label htmlFor={`${id}-nom`} className="tely-label">
            Nom
          </label>
          <input
            id={`${id}-nom`}
            data-autofocus
            type="text"
            maxLength={100}
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="tely-input mt-1.5"
            placeholder="Ex. Méthodes de révision"
            aria-invalid={!!(erreurs.nom || erreurs.slug)}
          />
          {(erreurs.nom || erreurs.slug) && <p className="tely-error mt-1">{(erreurs.nom ?? erreurs.slug)?.[0]}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor={`${id}-desc`} className="tely-label">
              Description <span className="font-normal text-gray-400">(facultatif)</span>
            </label>
            <span className={`text-[11px] font-semibold ${nbDescription > 300 ? "text-red-600" : "text-gray-400"}`}>{nbDescription} / 300</span>
          </div>
          <textarea
            id={`${id}-desc`}
            rows={3}
            maxLength={300}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="tely-input mt-1.5 resize-none"
            placeholder="Affichée en tête de la page de la catégorie."
          />
          {erreurs.description && <p className="tely-error mt-1">{erreurs.description[0]}</p>}
        </div>
        <fieldset>
          <legend className="tely-label">Couleur</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LISTE_COULEURS.map((c) => {
              const s = COULEURS_CATEGORIE[c];
              const actif = form.couleur === c;
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500 ${
                    actif ? `${s.actif} ring-2 ring-gray-900 ring-offset-2` : s.chip
                  }`}
                >
                  <input type="radio" name={`${id}-couleur`} value={c} checked={actif} onChange={() => setForm((f) => ({ ...f, couleur: c }))} className="sr-only" />
                  <span className={`h-2.5 w-2.5 rounded-full ${s.point} ${actif ? "ring-2 ring-white/70" : ""}`} aria-hidden="true" />
                  {s.libelle}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div>
          <label htmlFor={`${id}-ordre`} className="tely-label">
            Ordre d'affichage
          </label>
          <input
            id={`${id}-ordre`}
            type="number"
            min={0}
            max={999}
            inputMode="numeric"
            value={form.ordre}
            onChange={(e) => setForm((f) => ({ ...f, ordre: e.target.value }))}
            className="tely-input mt-1.5 w-32"
            aria-describedby={`${id}-ordre-aide`}
          />
          <p id={`${id}-ordre-aide`} className="mt-1 text-[11px] text-gray-400">
            Les catégories sont triées par ordre croissant, puis par nom.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="tely-overline mb-2">Aperçu</p>
          <CategorieBadge categorie={{ id: 0, nom: form.nom || "Nom de la catégorie", slug: "", couleur: form.couleur }} lien={false} taille="md" />
        </div>
        <button type="submit" className="sr-only" tabIndex={-1}>
          Enregistrer
        </button>
      </form>
    </Dialogue>
  );
}

function OngletCategories({
  categories,
  chargement,
  erreur,
  onRecharger,
}: {
  categories: CategorieBlog[];
  chargement: boolean;
  erreur: string | null;
  onRecharger: () => void;
}) {
  const toast = useToast();
  const [edition, setEdition] = useState<{ categorie: CategorieBlog | null } | null>(null);
  const [aSupprimer, setASupprimer] = useState<CategorieBlog | null>(null);
  const [suppression, setSuppression] = useState(false);

  async function confirmerSuppression() {
    if (!aSupprimer) return;
    setSuppression(true);
    try {
      await deleteCategorieBlog(aSupprimer.id);
      toast.success(`Catégorie « ${aSupprimer.nom} » supprimée.`);
      setASupprimer(null);
      onRecharger();
    } catch (e) {
      toast.error(lireErreur(e, "Suppression impossible.").message);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          {categories.length} catégorie{categories.length > 1 ? "s" : ""} · le nombre d'articles compte uniquement les articles publiés.
        </p>
        <button type="button" className="tely-btn-outline self-start px-4 py-2.5 sm:self-auto" onClick={() => setEdition({ categorie: null })}>
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tely-card h-32 animate-pulse" />
          ))}
        </div>
      ) : erreur ? (
        <div role="alert" className="tely-card py-12 text-center text-sm text-red-500">
          {erreur}
          <button type="button" className="tely-link ml-2" onClick={onRecharger}>
            Réessayer
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="tely-card flex flex-col items-center py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Tags size={22} className="text-amber-700" />
          </div>
          <p className="text-sm font-medium text-gray-700">Aucune catégorie</p>
          <p className="mt-1 max-w-sm text-xs text-gray-400">Créez des catégories (« Méthodes », « Brevet », « BAC »…) pour organiser le blog.</p>
          <button type="button" className="tely-btn mt-5" onClick={() => setEdition({ categorie: null })}>
            <Plus size={16} /> Créer une catégorie
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const s = styleCouleur(c.couleur);
            return (
              <li key={c.id} className="tely-card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${s.point}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{c.nom}</p>
                      <p className="truncate font-mono text-[11px] text-gray-400">/blog/categorie/{c.slug}</p>
                    </div>
                  </div>
                  <span className="tely-chip shrink-0" title="Ordre d'affichage">
                    #{c.ordre}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 min-h-8 text-xs text-gray-500">{c.description || <span className="italic text-gray-400">Sans description</span>}</p>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <FolderOpen size={14} aria-hidden="true" />
                    <span className="font-semibold text-gray-900">{c.articles_count}</span> article{c.articles_count > 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-1">
                    <button type="button" className="tely-icon-btn" onClick={() => setEdition({ categorie: c })} aria-label={`Modifier ${c.nom}`} title="Modifier">
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="tely-icon-btn hover:bg-red-50 hover:text-red-600"
                      onClick={() => setASupprimer(c)}
                      aria-label={`Supprimer ${c.nom}`}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {edition && (
        <CategorieModal
          key={edition.categorie?.id ?? "nouvelle"}
          ouvert
          categorie={edition.categorie}
          onFermer={() => setEdition(null)}
          onEnregistre={() => {
            setEdition(null);
            onRecharger();
          }}
        />
      )}

      <ConfirmModal
        open={aSupprimer !== null}
        title="Supprimer cette catégorie ?"
        description={aSupprimer ? `« ${aSupprimer.nom} » sera supprimée. Ses articles ne seront pas supprimés : ils passeront simplement sans catégorie.` : undefined}
        loading={suppression}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
        variant="danger"
        onCancel={() => setASupprimer(null)}
        onConfirm={() => void confirmerSuppression()}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function GestionBlog() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const onglet: Onglet = params.get("onglet") === "categories" ? "categories" : "articles";

  const [categories, setCategories] = useState<CategorieBlog[]>([]);
  const [chargementCat, setChargementCat] = useState(true);
  const [erreurCat, setErreurCat] = useState<string | null>(null);
  const [versionCat, setVersionCat] = useState(0);
  const [creation, setCreation] = useState(false);
  const creationLancee = useRef(false);

  useEffect(() => {
    let annule = false;
    getCategoriesBlog()
      .then((r) => {
        if (annule) return;
        setCategories(r.categories);
        setErreurCat(null);
      })
      .catch((e) => !annule && setErreurCat(lireErreur(e, "Impossible de charger les catégories.").message))
      .finally(() => !annule && setChargementCat(false));
    return () => {
      annule = true;
    };
  }, [versionCat]);

  const nouvelArticle = useCallback(async () => {
    if (creationLancee.current) return;
    creationLancee.current = true;
    setCreation(true);
    try {
      const article = await creerBrouillon();
      navigate(`/blog-editor/${article.id}`);
    } catch (e) {
      toast.error(lireErreur(e, "La création de l'article a échoué.").message);
      creationLancee.current = false;
      setCreation(false);
    }
  }, [navigate, toast]);

  // Action rapide « Nouvel article » (palette de commandes) : /Dashbord-admin/blog?nouveau=1
  const demandeNouveau = params.get("nouveau") === "1";
  useEffect(() => {
    if (!demandeNouveau) return;
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.delete("nouveau");
        return n;
      },
      { replace: true }
    );
    // Hors du corps de l'effet ; `creationLancee` évite une double création (StrictMode).
    window.setTimeout(() => void nouvelArticle(), 0);
  }, [demandeNouveau, nouvelArticle, setParams]);

  const changerOnglet = (o: Onglet) =>
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (o === "categories") n.set("onglet", "categories");
        else n.delete("onglet");
        return n;
      },
      { replace: true }
    );

  const onglets: { id: Onglet; libelle: string; icone: typeof Newspaper }[] = [
    { id: "articles", libelle: "Articles", icone: Newspaper },
    { id: "categories", libelle: "Catégories", icone: Tags },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="tely-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gray-50 text-gray-900">
            <Newspaper size={22} />
          </div>
          <div>
            <h1 className="tely-h1">Blog</h1>
            <p className="tely-subtitle mt-1">Rédigez, programmez et publiez des articles pour attirer et fidéliser les élèves.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <a href="/blog" target="_blank" rel="noopener noreferrer" className="tely-btn-outline px-4 py-2.5">
            <ExternalLink size={16} /> Voir le blog
          </a>
          <button type="button" onClick={() => void nouvelArticle()} disabled={creation} className="tely-btn px-4 py-2.5">
            {creation ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} Nouvel article
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div role="tablist" aria-label="Sections du blog" className="inline-flex rounded-[12px] bg-gray-100 p-1">
        {onglets.map((o) => (
          <button
            key={o.id}
            id={`onglet-${o.id}`}
            role="tab"
            type="button"
            aria-selected={onglet === o.id}
            aria-controls={`panneau-${o.id}`}
            onClick={() => changerOnglet(o.id)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
              onglet === o.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <o.icone size={16} /> {o.libelle}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
        {onglet === "articles" ? (
          <OngletArticles categories={categories} onNouveau={() => void nouvelArticle()} creation={creation} />
        ) : (
          <OngletCategories
            categories={categories}
            chargement={chargementCat}
            erreur={erreurCat}
            onRecharger={() => {
              setChargementCat(true);
              setVersionCat((n) => n + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}
