import { createElement, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Copy,
  ExternalLink,
  FilePlus2,
  FileText,
  House,
  LoaderCircle,
  PanelBottom,
  PanelTop,
  Pencil,
  Plus,
  Search,
  Trash2,
  WandSparkles,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { createPage, deletePage, duplicatePage, lireErreur, listPages } from "../../services/pageService";
import type { PageResume, StatutPage } from "../../features/pagebuilder/types";
import { MODELES } from "../../features/pagebuilder/templates";
import Dialogue from "../../features/pagebuilder/editor/Dialogue";
import { erreurSlug, slugifier } from "../../features/pagebuilder/utils/liens";

const FORMAT_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function dateRelative(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return FORMAT_DATE.format(d);
}

// ─── Création ─────────────────────────────────────────────────────────────

function CreationModal({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [modele, setModele] = useState<string>("vierge");
  const [titre, setTitre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouche, setSlugTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});

  const slugEffectif = slugTouche ? slug : slugifier(titre);
  const errSlug = titre || slugTouche ? erreurSlug(slugEffectif) : null;

  function choisirModele(id: string) {
    setModele(id);
    const m = MODELES.find((x) => x.id === id);
    if (m && !titre.trim()) setTitre(m.titreSuggere);
  }

  async function creer() {
    if (!titre.trim()) {
      setErreurs({ titre: ["Donnez un titre à votre page."] });
      return;
    }
    if (errSlug) return;
    const m = MODELES.find((x) => x.id === modele);
    setEnvoi(true);
    setErreurs({});
    try {
      const page = await createPage({
        titre: titre.trim(),
        slug: slugEffectif,
        statut: "brouillon",
        blocs: m ? m.blocs() : [],
        meta_description: m?.metaSuggeree ?? null,
      });
      toast.success("Page créée : vous pouvez maintenant la personnaliser.");
      navigate(`/page-builder/${page.id}`);
    } catch (e) {
      const err = lireErreur(e, "La création de la page a échoué.");
      if (err.status === 422) setErreurs(err.errors);
      else toast.error(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Dialogue
      ouvert={ouvert}
      onFermer={onFermer}
      titre="Nouvelle page"
      sousTitre="Partez d'un modèle prêt à l'emploi ou d'une page vierge."
      largeur="max-w-4xl"
      pied={
        <>
          <button type="button" className="tely-btn-outline py-2.5" onClick={onFermer} disabled={envoi}>
            Annuler
          </button>
          <button type="button" className="tely-btn py-2.5" onClick={() => void creer()} disabled={envoi || !!errSlug}>
            {envoi ? <LoaderCircle size={16} className="animate-spin" /> : <WandSparkles size={16} />}
            Créer et ouvrir l'éditeur
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="tely-label">Titre de la page</span>
          <input
            data-autofocus
            type="text"
            maxLength={150}
            value={titre}
            onChange={(e) => {
              setTitre(e.target.value);
              setErreurs((p) => ({ ...p, titre: [] }));
            }}
            onKeyDown={(e) => e.key === "Enter" && void creer()}
            placeholder="Ex. À propos de Tely"
            className="tely-input mt-1.5"
          />
          {erreurs.titre?.[0] && <span className="tely-error mt-1 block">{erreurs.titre[0]}</span>}
        </label>
        <label className="block">
          <span className="tely-label">Adresse</span>
          <div className="mt-1.5 flex items-center rounded-[10px] border border-gray-200 bg-gray-50 transition-all focus-within:border-gray-900">
            <span className="pl-3 text-sm text-gray-400">/p/</span>
            <input
              type="text"
              maxLength={120}
              value={slugEffectif}
              onChange={(e) => {
                setSlugTouche(true);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              className="min-w-0 flex-1 bg-transparent px-1 py-3.5 text-sm text-gray-900 outline-none"
            />
          </div>
          {(errSlug || erreurs.slug?.[0]) && <span className="tely-error mt-1 block">{erreurs.slug?.[0] ?? errSlug}</span>}
        </label>
      </div>

      <p className="tely-overline mb-3 mt-6">Modèle</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Modèle de page">
        {[{ id: "vierge", nom: "Page vierge", description: "Commencez de zéro et composez librement.", icone: FilePlus2 }, ...MODELES].map((m) => {
          const actif = modele === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => choisirModele(m.id)}
              className={`flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                actif ? "border-gray-900 bg-gray-50 shadow-sm ring-1 ring-gray-900" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${actif ? "bg-gray-900 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                {createElement(m.icone, { size: 19 })}
              </span>
              <span className="mt-3 text-sm font-bold text-gray-900">{m.nom}</span>
              <span className="mt-1 text-xs leading-relaxed text-gray-500">{m.description}</span>
            </button>
          );
        })}
      </div>
    </Dialogue>
  );
}

// ─── Liste ────────────────────────────────────────────────────────────────

export default function GestionPages() {
  const navigate = useNavigate();
  const toast = useToast();
  const [pages, setPages] = useState<PageResume[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [rechercheDiff, setRechercheDiff] = useState("");
  const [statut, setStatut] = useState<StatutPage | "">("");
  const [rafraichir, setRafraichir] = useState(0);
  const [creation, setCreation] = useState(false);
  const [aSupprimer, setASupprimer] = useState<PageResume | null>(null);
  const [suppression, setSuppression] = useState(false);
  const [duplication, setDuplication] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setRechercheDiff(recherche), 300);
    return () => window.clearTimeout(t);
  }, [recherche]);

  useEffect(() => {
    let annule = false;
    listPages({ statut, search: rechercheDiff })
      .then((p) => {
        if (annule) return;
        setPages(p);
        setErreur(null);
      })
      .catch((e) => !annule && setErreur(lireErreur(e, "Impossible de charger les pages.").message))
      .finally(() => !annule && setChargement(false));
    return () => {
      annule = true;
    };
  }, [statut, rechercheDiff, rafraichir]);

  const compteurs = useMemo(
    () => ({ publiees: pages.filter((p) => p.statut === "publie").length, brouillons: pages.filter((p) => p.statut === "brouillon").length }),
    [pages]
  );

  async function dupliquer(p: PageResume) {
    setDuplication(p.id);
    try {
      const copie = await duplicatePage(p.id);
      toast.success(`Page dupliquée : « ${copie.titre} ».`);
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
      await deletePage(aSupprimer.id);
      setPages((prev) => prev.filter((x) => x.id !== aSupprimer.id));
      toast.success(`La page « ${aSupprimer.titre} » a été supprimée.`);
      setASupprimer(null);
    } catch (e) {
      toast.error(lireErreur(e, "Suppression impossible.").message);
    } finally {
      setSuppression(false);
    }
  }

  const filtres: { valeur: StatutPage | ""; libelle: string }[] = [
    { valeur: "", libelle: "Toutes" },
    { valeur: "publie", libelle: "Publiées" },
    { valeur: "brouillon", libelle: "Brouillons" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="tely-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gray-50 text-gray-900">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="tely-h1">Pages du site</h1>
            <p className="tely-subtitle mt-1">Créez et publiez des pages marketing, légales ou informatives avec l'éditeur visuel.</p>
          </div>
        </div>
        <button type="button" onClick={() => setCreation(true)} className="tely-btn self-start sm:self-auto">
          <Plus size={16} /> Nouvelle page
        </button>
      </div>

      {/* Barre d'outils */}
      <div className="tely-card flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-1 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)] md:max-w-md">
          <Search size={16} className="shrink-0 text-gray-900" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par titre ou adresse…"
            aria-label="Rechercher une page"
            className="w-full flex-1 border-none bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-3">
          <div role="radiogroup" aria-label="Filtrer par statut" className="inline-flex rounded-[10px] bg-gray-100 p-1">
            {filtres.map((f) => (
              <button
                key={f.valeur}
                type="button"
                role="radio"
                aria-checked={statut === f.valeur}
                onClick={() => {
                  setChargement(true);
                  setStatut(f.valeur);
                }}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statut === f.valeur ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {f.libelle}
              </button>
            ))}
          </div>
          {!statut && !chargement && (
            <span className="hidden whitespace-nowrap text-xs text-gray-500 lg:inline">
              <span className="font-semibold text-gray-800">{compteurs.publiees}</span> publiée(s) ·{" "}
              <span className="font-semibold text-gray-800">{compteurs.brouillons}</span> brouillon(s)
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      {chargement ? (
        <div className="tely-card divide-y divide-gray-100" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 rounded-[10px] bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-100" />
              </div>
              <div className="hidden h-5 w-20 rounded-full bg-gray-100 sm:block" />
              <div className="h-8 w-24 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      ) : erreur ? (
        <div className="tely-card py-16 text-center text-sm text-red-500">
          {erreur}
          <button type="button" className="tely-link ml-2" onClick={() => { setChargement(true); setRafraichir((n) => n + 1); }}>
            Réessayer
          </button>
        </div>
      ) : pages.length === 0 ? (
        <div className="tely-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <FileText size={22} className="text-amber-700" />
          </div>
          <p className="text-sm font-medium text-gray-700">{recherche || statut ? "Aucune page ne correspond" : "Aucune page pour l'instant"}</p>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            {recherche || statut ? "Modifiez la recherche ou le filtre." : "Créez votre première page à partir d'un modèle en quelques secondes."}
          </p>
          {!recherche && !statut && (
            <button type="button" className="tely-btn mt-5" onClick={() => setCreation(true)}>
              <Plus size={16} /> Créer une page
            </button>
          )}
        </div>
      ) : (
        <ul className="tely-card divide-y divide-gray-100 overflow-hidden">
          {pages.map((p) => {
            const publie = p.statut === "publie";
            return (
              <li key={p.id} className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50/60 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${p.est_accueil ? "bg-amber-500 text-gray-900" : "bg-gray-50 text-gray-900"}`}>
                    {p.est_accueil ? <House size={18} /> : <FileText size={18} />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link to={`/page-builder/${p.id}`} className="truncate text-sm font-bold text-gray-900 hover:underline">
                        {p.titre}
                      </Link>
                      <span className={`tely-chip ${publie ? "bg-emerald-50 text-emerald-700" : ""}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${publie ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {publie ? "Publiée" : "Brouillon"}
                      </span>
                      {p.est_accueil && (
                        <span className="tely-chip bg-amber-100 text-amber-800">
                          <House size={11} /> Accueil
                        </span>
                      )}
                      {p.dans_menu && (
                        <span className="tely-chip">
                          <PanelTop size={11} /> Menu
                        </span>
                      )}
                      {p.dans_footer && (
                        <span className="tely-chip">
                          <PanelBottom size={11} /> Pied de page
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      <span className="font-mono">/p/{p.slug}</span> · Modifiée le {dateRelative(p.updated_at)}
                      {p.modifie_par && ` par ${p.modifie_par.prenom} ${p.modifie_par.nom}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                  <button type="button" onClick={() => navigate(`/page-builder/${p.id}`)} className="tely-btn-outline px-3 py-2 text-xs">
                    <Pencil size={14} /> Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => void dupliquer(p)}
                    disabled={duplication === p.id}
                    className="tely-icon-btn"
                    title="Dupliquer"
                    aria-label={`Dupliquer ${p.titre}`}
                  >
                    {duplication === p.id ? <LoaderCircle size={16} className="animate-spin" /> : <Copy size={16} />}
                  </button>
                  {publie ? (
                    <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="tely-icon-btn" title="Voir la page" aria-label={`Voir ${p.titre} dans un nouvel onglet`}>
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <span className="tely-icon-btn cursor-not-allowed opacity-30" title="Publiez la page pour la voir sur le site" aria-hidden="true">
                      <ExternalLink size={16} />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setASupprimer(p)}
                    className="tely-icon-btn hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                    aria-label={`Supprimer ${p.titre}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {creation && <CreationModal ouvert={creation} onFermer={() => setCreation(false)} />}

      <ConfirmModal
        open={aSupprimer !== null}
        title="Supprimer cette page ?"
        description={
          aSupprimer
            ? `« ${aSupprimer.titre} » sera supprimée${aSupprimer.statut === "publie" ? " et ne sera plus accessible sur le site" : ""}. Cette action est irréversible.`
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
