import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Blocks, CalendarClock, ExternalLink, FileText, LoaderCircle, Save, Send, SlidersHorizontal } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getArticleAdmin, getCategoriesBlog, lireErreur, updateArticle } from "../../services/blogService";
import type { ArticleAdmin, CategorieBlog } from "../../types/blog";
import { useEditeurBlocs } from "../../features/pagebuilder/editor/useEditeurBlocs";
import {
  BoutonsHistorique,
  EditeurErreur,
  EditeurSquelette,
  EtatEnregistrement,
  SelecteurAppareil,
  ZoneEditeur,
} from "../../features/pagebuilder/editor/ZoneEditeur";
import ArticleEntete from "../../features/blog/components/ArticleEntete";
import { BadgeStatut } from "../../features/blog/components/Elements";
import PanneauArticle from "../../features/blog/editor/PanneauArticle";
import {
  CHAMPS_ARTICLE,
  DOC_ARTICLE_VIDE,
  docDepuisArticle,
  donneesDepuisDoc,
  estVisible,
  MAX_BLOCS_ARTICLE,
  normaliserErreurs,
  TITRE_MAX,
  validerArticle,
  type DocArticle,
} from "../../features/blog/editor/etatArticle";
import { dateHeureLongue, estimerTempsLecture, localVersIso, urlArticle } from "../../features/blog/utils";

type Envoi = null | "enregistrer" | "publier";

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [serveur, setServeur] = useState<ArticleAdmin | null>(null);
  const [categories, setCategories] = useState<CategorieBlog[]>([]);
  const [suggestionsTags, setSuggestionsTags] = useState<string[]>([]);
  const [envoi, setEnvoi] = useState<Envoi>(null);

  const sauvegardeRef = useRef<() => void>(() => {});
  const e = useEditeurBlocs<DocArticle>({
    docVide: DOC_ARTICLE_VIDE,
    maxBlocs: MAX_BLOCS_ARTICLE,
    sujet: "Un article",
    champsDoc: CHAMPS_ARTICLE,
    sauvegardeRef,
  });
  const { doc, docRef, modifie, charger, synchroniser, appliquerErreurs, setErreurs, changerDoc } = e;

  // ─── Chargement ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let annule = false;
    getArticleAdmin(id)
      .then((article) => {
        if (annule) return;
        charger(docDepuisArticle(article));
        setServeur(article);
        setErreurChargement(null);
      })
      .catch((err) => {
        if (annule) return;
        const er = lireErreur(err, "Impossible de charger l'article.");
        setErreurChargement(er.status === 404 ? "Cet article n'existe pas ou a été supprimé." : er.message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    // Catégories et mots-clés populaires (non bloquant)
    getCategoriesBlog()
      .then((r) => {
        if (annule) return;
        setCategories(r.categories);
        setSuggestionsTags(r.tags.map((t) => t.tag));
      })
      .catch(() => undefined);
    return () => {
      annule = true;
    };
  }, [id, charger]);

  // ─── Enregistrement ──────────────────────────────────────────────────
  async function enregistrer(modif?: Partial<DocArticle>, source: Exclude<Envoi, null> = "enregistrer") {
    if (!id || envoi || !serveur) return;
    if (modif) changerDoc(modif);
    const aEnvoyer: DocArticle = { ...docRef.current, ...modif };
    const ids = aEnvoyer.blocs.map((b) => b.id);

    const locales = validerArticle(aEnvoyer);
    if (Object.keys(locales).length > 0) {
      appliquerErreurs(locales, ids);
      return;
    }

    const etaitVisible = estVisible(serveur);
    setEnvoi(source);
    setErreurs({});
    try {
      const article = await updateArticle(id, donneesDepuisDoc(aEnvoyer, serveur));
      synchroniser(docDepuisArticle(article), aEnvoyer);
      setServeur((prev) => ({ ...article, auteur: article.auteur ?? prev?.auteur ?? null }));
      if (article.statut === "brouillon") toast.success(serveur.statut === "publie" ? "Article repassé en brouillon : il n'est plus visible." : "Brouillon enregistré.");
      else if (article.est_programme) toast.success(`Article programmé : publication le ${dateHeureLongue(article.publie_le)}.`);
      else if (!etaitVisible) toast.success("Article publié : il est maintenant visible sur le blog.");
      else toast.success("Modifications enregistrées.");
    } catch (err) {
      const er = lireErreur(err, "L'enregistrement a échoué.");
      if (er.status === 422) appliquerErreurs(normaliserErreurs(er.errors), ids);
      else toast.error(er.message);
    } finally {
      setEnvoi(null);
    }
  }

  // Ctrl+S
  useEffect(() => {
    sauvegardeRef.current = () => void enregistrer();
  });

  // ─── Aperçu de l'en-tête ─────────────────────────────────────────────
  const tempsLecture = useMemo(() => estimerTempsLecture(doc.blocs), [doc.blocs]);
  const categorie = categories.find((c) => c.id === doc.categorie_blog_id) ?? (serveur?.categorie?.id === doc.categorie_blog_id ? serveur?.categorie : null) ?? null;

  if (chargement) return <EditeurSquelette />;
  if (erreurChargement || !serveur) {
    return <EditeurErreur message={erreurChargement ?? "Impossible de charger l'article."} retour="/Dashbord-admin/blog" libelleRetour="Retour au blog" />;
  }

  const visible = estVisible(serveur);
  const libelleDate =
    doc.publication === "brouillon"
      ? "Brouillon — non publié"
      : doc.publication === "programme"
        ? doc.date_programmee
          ? `Programmé le ${dateHeureLongue(localVersIso(doc.date_programmee))}`
          : "Date de programmation à choisir"
        : visible
          ? undefined
          : "Publication à l'enregistrement";

  const ouvrirPanneauArticle = () => {
    e.setSelectionId(null);
    e.setOngletDroit("doc");
    e.setPanneauMobile("inspecteur");
  };

  const entete = (
    <div
      role="button"
      tabIndex={0}
      aria-label="En-tête de l'article : modifier le titre, l'extrait, la couverture et la catégorie dans le panneau « Article »"
      onClick={(ev) => {
        ev.stopPropagation();
        ouvrirPanneauArticle();
      }}
      onKeyDown={(ev) => {
        if ((ev.key === "Enter" || ev.key === " ") && ev.target === ev.currentTarget) {
          ev.preventDefault();
          ouvrirPanneauArticle();
        }
      }}
      className="group/entete relative cursor-pointer outline-none"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 transition-all ${
          e.nbErreursDoc > 0
            ? "ring-2 ring-inset ring-red-500"
            : "group-hover/entete:ring-1 group-hover/entete:ring-inset group-hover/entete:ring-amber-400/70 group-focus-visible/entete:ring-2 group-focus-visible/entete:ring-inset group-focus-visible/entete:ring-gray-900"
        }`}
      />
      <span
        className={`pointer-events-none absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-opacity ${
          e.nbErreursDoc > 0 ? "bg-red-500 text-white opacity-100" : "bg-amber-500 text-gray-900 opacity-0 group-hover/entete:opacity-100"
        }`}
      >
        <FileText size={11} /> En-tête de l'article
      </span>
      <ArticleEntete
        apercu
        titre={doc.titre}
        extrait={doc.extrait}
        categorie={categorie}
        auteur={serveur.auteur}
        publieLe={visible ? serveur.publie_le : null}
        libelleDate={libelleDate}
        tempsLecture={tempsLecture}
        couverture={doc.image_couverture || null}
      />
    </div>
  );

  // Bouton principal contextuel
  const principal =
    doc.publication === "programme"
      ? { libelle: serveur.est_programme && !modifie ? "Programmé" : "Programmer", icone: CalendarClock, desactive: serveur.est_programme && !modifie, modif: undefined }
      : doc.publication === "maintenant"
        ? { libelle: visible ? "Mettre à jour" : "Publier", icone: Send, desactive: visible && !modifie, modif: undefined }
        : { libelle: "Publier", icone: Send, desactive: false, modif: { publication: "maintenant" as const } };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 font-sans text-gray-900">
      {/* ── Barre supérieure ─────────────────────────────────────────── */}
      <header className="z-40 flex h-14 shrink-0 items-center gap-1.5 border-b border-gray-200 bg-white px-2 sm:gap-2 sm:px-3">
        <Link to="/Dashbord-admin/blog" className="tely-icon-btn" aria-label="Retour à la liste des articles" title="Retour aux articles">
          <ArrowLeft size={18} />
        </Link>
        <button type="button" onClick={() => e.setPanneauMobile("palette")} className="tely-icon-btn lg:hidden" aria-label="Ouvrir la palette de blocs">
          <Blocks size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            type="text"
            value={doc.titre}
            maxLength={TITRE_MAX}
            onChange={(ev) => changerDoc({ titre: ev.target.value }, "titre")}
            aria-label="Titre de l'article"
            placeholder="Titre de l'article"
            className={`min-w-0 max-w-xs flex-1 truncate rounded-lg border bg-transparent px-2 py-1.5 text-sm font-bold text-gray-900 outline-none transition-colors hover:border-gray-200 focus:border-gray-900 focus:bg-white ${
              e.erreurs.titre ? "border-red-300" : "border-transparent"
            }`}
          />
          <span className="hidden shrink-0 sm:inline-flex">
            <BadgeStatut article={serveur} />
          </span>
          <EtatEnregistrement modifie={modifie} majLe={serveur.updated_at} />
        </div>

        <SelecteurAppareil appareil={e.appareil} onChanger={e.setAppareil} />
        <BoutonsHistorique e={e} />

        <button
          type="button"
          onClick={ouvrirPanneauArticle}
          className={`tely-icon-btn relative ${e.ongletDroit === "doc" ? "bg-gray-100" : ""}`}
          title="Paramètres de l'article"
          aria-label="Paramètres de l'article"
        >
          <FileText size={17} />
          {e.nbErreursDoc > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
        </button>
        <button
          type="button"
          onClick={() => {
            e.setOngletDroit("bloc");
            e.setPanneauMobile("inspecteur");
          }}
          className="tely-icon-btn xl:hidden"
          aria-label="Ouvrir l'inspecteur"
        >
          <SlidersHorizontal size={17} />
        </button>

        <a
          href={urlArticle(serveur.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className={`tely-icon-btn hidden sm:inline-flex ${visible ? "" : "pointer-events-none opacity-40"}`}
          title={visible ? "Voir l'article (nouvel onglet)" : "L'article n'est pas encore visible du public"}
          aria-label="Voir l'article dans un nouvel onglet"
          aria-disabled={!visible || undefined}
          tabIndex={visible ? undefined : -1}
        >
          <ExternalLink size={17} />
        </a>

        <button type="button" onClick={() => void enregistrer()} disabled={!!envoi} className="tely-btn-outline px-3 py-2" title="Enregistrer (Ctrl+S)">
          {envoi === "enregistrer" ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
          <span className="hidden lg:inline">Enregistrer</span>
        </button>
        <button
          type="button"
          onClick={() => void enregistrer(principal.modif, "publier")}
          disabled={!!envoi || principal.desactive}
          className="tely-btn px-3 py-2"
          title={doc.publication === "programme" ? "Enregistrer et programmer la publication" : "Publier l'article"}
        >
          {envoi === "publier" ? <LoaderCircle size={15} className="animate-spin" /> : <principal.icone size={15} />}
          <span className="hidden sm:inline">{principal.libelle}</span>
        </button>
      </header>

      <ZoneEditeur
        e={e}
        ongletDoc={{ libelle: "Paramètres de l'article", libelleCourt: "Article", icone: FileText }}
        panneauDoc={
          <PanneauArticle doc={doc} erreurs={e.erreurs} onChanger={changerDoc} categories={categories} suggestionsTags={suggestionsTags} serveur={serveur} />
        }
        libelleCanevas="Canevas de l'article"
        complementDoc="de l'article"
        entete={entete}
        messageVide={{ titre: "Votre article est vide", texte: "Ajoutez des blocs « Texte », « Image », « Vidéo »… depuis la palette pour rédiger le contenu." }}
      />
    </div>
  );
}
