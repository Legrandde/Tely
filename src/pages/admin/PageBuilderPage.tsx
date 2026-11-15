import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Blocks, ExternalLink, LoaderCircle, Save, Send, Settings2, SlidersHorizontal, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getPage, lireErreur, updatePage } from "../../services/pageService";
import type { StatutPage } from "../../features/pagebuilder/types";
import { erreurSlug, lienSur, MAX_BLOCS, validerBlocs } from "../../features/pagebuilder/utils/liens";
import { docDepuisPage, type DocEditeur } from "../../features/pagebuilder/editor/etat";
import { useEditeurBlocs } from "../../features/pagebuilder/editor/useEditeurBlocs";
import {
  BoutonsHistorique,
  EditeurErreur,
  EditeurSquelette,
  EtatEnregistrement,
  SelecteurAppareil,
  ZoneEditeur,
} from "../../features/pagebuilder/editor/ZoneEditeur";
import ParametresPage from "../../features/pagebuilder/editor/ParametresPage";

const DOC_VIDE: DocEditeur = {
  titre: "",
  slug: "",
  meta_description: "",
  image_og: "",
  est_accueil: false,
  dans_menu: false,
  dans_footer: false,
  blocs: [],
};

const CHAMPS_PAGE = ["titre", "slug", "meta_description", "image_og", "est_accueil", "dans_menu", "dans_footer"];

export default function PageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [statut, setStatut] = useState<StatutPage>("brouillon");
  const [slugPublie, setSlugPublie] = useState("");
  const [majLe, setMajLe] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState<null | "enregistrer" | "publier" | "depublier">(null);

  const sauvegardeRef = useRef<() => void>(() => {});
  const e = useEditeurBlocs<DocEditeur>({ docVide: DOC_VIDE, maxBlocs: MAX_BLOCS, sujet: "Une page", champsDoc: CHAMPS_PAGE, sauvegardeRef });
  const { doc, docRef, modifie, charger, synchroniser, appliquerErreurs, setErreurs, changerDoc: changerPage } = e;

  // ─── Chargement ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let annule = false;
    getPage(id)
      .then((page) => {
        if (annule) return;
        charger(docDepuisPage(page));
        setStatut(page.statut);
        setSlugPublie(page.slug);
        setMajLe(page.updated_at);
        setErreurChargement(null);
      })
      .catch((err) => {
        if (!annule) setErreurChargement(lireErreur(err, "Impossible de charger la page.").status === 404 ? "Cette page n'existe pas ou a été supprimée." : lireErreur(err, "Impossible de charger la page.").message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [id, charger]);

  // ─── Enregistrement ──────────────────────────────────────────────────
  async function enregistrer(nouveauStatut?: StatutPage) {
      if (!id || envoi) return;
      const aEnvoyer = docRef.current;
      const ids = aEnvoyer.blocs.map((b) => b.id);

      // Validation côté client (identique au serveur)
      const locales: Record<string, string[]> = { ...validerBlocs(aEnvoyer.blocs) };
      if (!aEnvoyer.titre.trim()) locales.titre = ["Le titre est obligatoire."];
      const es = erreurSlug(aEnvoyer.slug);
      if (es) locales.slug = [es];
      if (aEnvoyer.image_og && !lienSur(aEnvoyer.image_og)) locales.image_og = ["Le lien fourni n'est pas autorisé."];

      if (Object.keys(locales).length > 0) {
        appliquerErreurs(locales, ids);
        return;
      }

      setEnvoi(nouveauStatut === "publie" ? "publier" : nouveauStatut === "brouillon" ? "depublier" : "enregistrer");
      setErreurs({});
      try {
        const page = await updatePage(id, {
          titre: aEnvoyer.titre.trim(),
          slug: aEnvoyer.slug,
          meta_description: aEnvoyer.meta_description.trim() || null,
          image_og: aEnvoyer.image_og.trim() || null,
          est_accueil: aEnvoyer.est_accueil,
          dans_menu: aEnvoyer.dans_menu,
          dans_footer: aEnvoyer.dans_footer,
          blocs: aEnvoyer.blocs,
          ...(nouveauStatut ? { statut: nouveauStatut } : {}),
        });
        // Si rien n'a bougé pendant l'envoi, on aligne l'éditeur sur la version serveur (slug normalisé…)
        synchroniser(docDepuisPage(page), aEnvoyer);
        setStatut(page.statut);
        setSlugPublie(page.slug);
        setMajLe(page.updated_at);
        toast.success(
          nouveauStatut === "publie" ? "Page publiée : elle est maintenant visible sur le site." : nouveauStatut === "brouillon" ? "Page repassée en brouillon." : "Modifications enregistrées."
        );
      } catch (err) {
        const erreur = lireErreur(err, "L'enregistrement a échoué.");
        if (erreur.status === 422) {
          appliquerErreurs(erreur.errors, ids);
        } else {
          toast.error(erreur.message);
        }
      } finally {
        setEnvoi(null);
      }
  }

  // Ctrl+S
  useEffect(() => {
    sauvegardeRef.current = () => void enregistrer();
  });

  // ─── Rendu ───────────────────────────────────────────────────────────
  const publie = statut === "publie";
  const urlPublique = `/p/${slugPublie}`;

  if (chargement) return <EditeurSquelette />;

  if (erreurChargement) {
    return <EditeurErreur message={erreurChargement} retour="/Dashbord-admin/pages" libelleRetour="Retour aux pages" />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 font-sans text-gray-900">
      {/* ── Barre supérieure ─────────────────────────────────────────── */}
      <header className="z-40 flex h-14 shrink-0 items-center gap-1.5 border-b border-gray-200 bg-white px-2 sm:gap-2 sm:px-3">
        <Link to="/Dashbord-admin/pages" className="tely-icon-btn" aria-label="Retour à la liste des pages" title="Retour aux pages">
          <ArrowLeft size={18} />
        </Link>
        <button type="button" onClick={() => e.setPanneauMobile("palette")} className="tely-icon-btn lg:hidden" aria-label="Ouvrir la palette de blocs">
          <Blocks size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            type="text"
            value={doc.titre}
            maxLength={150}
            onChange={(ev) => changerPage({ titre: ev.target.value }, "titre")}
            aria-label="Titre de la page"
            placeholder="Titre de la page"
            className={`min-w-0 max-w-xs flex-1 truncate rounded-lg border bg-transparent px-2 py-1.5 text-sm font-bold text-gray-900 outline-none transition-colors hover:border-gray-200 focus:border-gray-900 focus:bg-white ${
              e.erreurs.titre ? "border-red-300" : "border-transparent"
            }`}
          />
          <span
            className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex ${
              publie ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${publie ? "bg-emerald-500" : "bg-gray-400"}`} />
            {publie ? "Publiée" : "Brouillon"}
          </span>
          <EtatEnregistrement modifie={modifie} majLe={majLe} />
        </div>

        {/* Aperçu responsive */}
        <SelecteurAppareil appareil={e.appareil} onChanger={e.setAppareil} />

        <BoutonsHistorique e={e} />

        <button
          type="button"
          onClick={() => {
            e.setOngletDroit("doc");
            e.setPanneauMobile("inspecteur");
          }}
          className={`tely-icon-btn relative ${e.ongletDroit === "doc" ? "bg-gray-100" : ""}`}
          title="Paramètres de la page"
          aria-label="Paramètres de la page"
        >
          <Settings2 size={17} />
          {e.nbErreursDoc > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
        </button>
        <button type="button" onClick={() => { e.setOngletDroit("bloc"); e.setPanneauMobile("inspecteur"); }} className="tely-icon-btn xl:hidden" aria-label="Ouvrir l'inspecteur">
          <SlidersHorizontal size={17} />
        </button>

        <a
          href={urlPublique}
          target="_blank"
          rel="noopener noreferrer"
          className={`tely-icon-btn hidden sm:inline-flex ${publie ? "" : "opacity-50"}`}
          title={publie ? "Voir la page (nouvel onglet)" : "La page n'est pas publiée : elle n'est pas encore visible du public"}
          aria-label="Voir la page dans un nouvel onglet"
        >
          <ExternalLink size={17} />
        </a>

        <button
          type="button"
          onClick={() => void enregistrer()}
          disabled={!!envoi}
          className="tely-btn-outline px-3 py-2"
          title="Enregistrer (Ctrl+S)"
        >
          {envoi === "enregistrer" ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
          <span className="hidden lg:inline">Enregistrer</span>
        </button>
        {publie ? (
          <button type="button" onClick={() => void enregistrer("brouillon")} disabled={!!envoi} className="tely-btn-outline px-3 py-2" title="Repasser la page en brouillon">
            {envoi === "depublier" ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />}
            <span className="hidden lg:inline">Dépublier</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void enregistrer("publie")}
          disabled={!!envoi || (publie && !modifie)}
          className="tely-btn px-3 py-2"
          title={publie ? "Publier les modifications" : "Publier la page"}
        >
          {envoi === "publier" ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
          <span className="hidden sm:inline">{publie ? "Mettre à jour" : "Publier"}</span>
        </button>
      </header>

      <ZoneEditeur
        e={e}
        ongletDoc={{ libelle: "Paramètres de la page", libelleCourt: "Page", icone: Settings2 }}
        panneauDoc={<ParametresPage doc={doc} erreurs={e.erreurs} onChanger={changerPage} />}
        libelleCanevas="Canevas de la page"
        complementDoc="de la page"
      />
    </div>
  );
}
