/**
 * Logique commune des éditeurs à blocs (page builder, articles du blog) :
 * historique annuler/rétablir, opérations sur les blocs, erreurs 422 rattachées
 * aux blocs, raccourcis clavier et garde des modifications non enregistrées.
 *
 * L'interface (barre supérieure, panneau « document ») reste propre à chaque éditeur ;
 * la zone palette / canevas / inspecteur est fournie par `ZoneEditeur`.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type RefObject } from "react";
import { useBlocker } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import type { Bloc, TypeBloc } from "../types";
import { creerBloc, dupliquerBloc } from "../registry";
import {
  deplacer,
  historiqueInitial,
  inserer,
  reducteurHistorique,
  serialiser,
  type Appareil,
  type DocAvecBlocs,
} from "./etat";

/** Onglet du panneau de droite : bloc sélectionné ou paramètres du document. */
export type OngletEditeur = "bloc" | "doc";
export type PanneauMobile = "palette" | "inspecteur" | null;

export interface OptionsEditeurBlocs<D extends DocAvecBlocs> {
  docVide: D;
  maxBlocs: number;
  /** Sujet des messages de limite : « Une page », « Un article »… */
  sujet: string;
  /** Champs du document (hors blocs) : une erreur sur l'un d'eux ouvre l'onglet « document ». */
  champsDoc: readonly string[];
  /** Fonction appelée par Ctrl+S (mise à jour par l'éditeur à chaque rendu). */
  sauvegardeRef: RefObject<() => void>;
}

function estChampSaisie(cible: EventTarget | null) {
  const el = cible as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export function useEditeurBlocs<D extends DocAvecBlocs>({ docVide, maxBlocs, sujet, champsDoc, sauvegardeRef }: OptionsEditeurBlocs<D>) {
  const toast = useToast();
  const [historique, dispatch] = useReducer(reducteurHistorique<D>, docVide, historiqueInitial<D>);
  const [enregistre, setEnregistre] = useState<string>(() => serialiser(docVide));

  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [ongletDroit, setOngletDroit] = useState<OngletEditeur>("bloc");
  const [appareil, setAppareil] = useState<Appareil>("desktop");
  const [glissementPalette, setGlissementPalette] = useState<TypeBloc | null>(null);
  const [ajoutIndex, setAjoutIndex] = useState<number | null>(null);
  const [panneauMobile, setPanneauMobile] = useState<PanneauMobile>(null);
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});
  /** Identifiants des blocs au moment de l'envoi (pour relier `blocs.N.props` au bon bloc). */
  const [idsEnvoyes, setIdsEnvoyes] = useState<string[]>([]);
  const [suppressionId, setSuppressionId] = useState<string | null>(null);

  const doc = historique.present;
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  const modifie = useMemo(() => serialiser(doc) !== enregistre, [doc, enregistre]);

  // ─── Chargement / synchronisation serveur ────────────────────────────
  /** Remplace le document (chargement initial) et vide l'historique. */
  const charger = useCallback((d: D) => {
    dispatch({ type: "reinitialiser", doc: d });
    setEnregistre(serialiser(d));
  }, []);

  /**
   * Après un enregistrement réussi : si rien n'a bougé pendant l'envoi, on aligne
   * l'éditeur sur la version serveur (slug normalisé…), sans entrée d'historique.
   */
  const synchroniser = useCallback((serveur: D, envoye: D) => {
    if (serialiser(docRef.current) === serialiser(envoye)) {
      dispatch({ type: "remplacer", doc: serveur });
    }
    setEnregistre(serialiser(serveur));
  }, []);

  // ─── Modifications ───────────────────────────────────────────────────
  const modifier = useCallback((maj: (d: D) => D, cle?: string) => {
    dispatch({ type: "modifier", doc: maj(docRef.current), cle, date: Date.now() });
  }, []);

  const modifierBlocs = useCallback(
    (maj: (b: Bloc[]) => Bloc[], cle?: string) => modifier((d) => ({ ...d, blocs: maj(d.blocs) }), cle),
    [modifier]
  );

  const effacerErreurBloc = useCallback(
    (blocId: string) => {
      const i = idsEnvoyes.indexOf(blocId);
      if (i === -1) return;
      setErreurs((prev) => {
        const cle = Object.keys(prev).filter((k) => k.startsWith(`blocs.${i}.`));
        if (cle.length === 0) return prev;
        const copie = { ...prev };
        cle.forEach((k) => delete copie[k]);
        return copie;
      });
    },
    [idsEnvoyes]
  );

  const messageLimite = `${sujet} ne peut pas contenir plus de ${maxBlocs} blocs.`;

  function insererBloc(type: TypeBloc, index: number) {
    if (doc.blocs.length >= maxBlocs) {
      toast.warning(messageLimite);
      return;
    }
    const bloc = creerBloc(type);
    modifierBlocs((b) => inserer(b, index, bloc));
    setSelectionId(bloc.id);
    setOngletDroit("bloc");
  }

  function ajouterBloc(type: TypeBloc) {
    const iSel = selectionId ? doc.blocs.findIndex((b) => b.id === selectionId) : -1;
    insererBloc(type, iSel === -1 ? doc.blocs.length : iSel + 1);
    setPanneauMobile(null);
  }

  const deplacerBloc = (blocId: string, vers: number) =>
    modifierBlocs((b) => deplacer(b, b.findIndex((x) => x.id === blocId), vers));

  const decaler = (blocId: string, delta: number) =>
    modifierBlocs((b) => {
      const i = b.findIndex((x) => x.id === blocId);
      return deplacer(b, i, i + delta);
    });

  function dupliquer(blocId: string) {
    if (doc.blocs.length >= maxBlocs) {
      toast.warning(messageLimite);
      return;
    }
    const i = doc.blocs.findIndex((b) => b.id === blocId);
    if (i === -1) return;
    const copie = dupliquerBloc(doc.blocs[i]);
    modifierBlocs((b) => inserer(b, i + 1, copie));
    setSelectionId(copie.id);
  }

  const basculerMasque = (blocId: string) =>
    modifierBlocs((b) => b.map((x) => (x.id === blocId ? { ...x, masque: !x.masque } : x)));

  function supprimer(blocId: string) {
    const i = doc.blocs.findIndex((b) => b.id === blocId);
    modifierBlocs((b) => b.filter((x) => x.id !== blocId));
    effacerErreurBloc(blocId);
    const voisin = doc.blocs[i + 1] ?? doc.blocs[i - 1];
    setSelectionId(voisin?.id ?? null);
    setSuppressionId(null);
    toast.info("Bloc supprimé — Ctrl+Z pour annuler.");
  }

  function changerProp(blocId: string, cle: string, valeur: unknown, fusion?: boolean) {
    modifierBlocs(
      (b) => b.map((x) => (x.id === blocId ? { ...x, props: { ...x.props, [cle]: valeur } } : x)),
      fusion ? `${blocId}.${cle}` : undefined
    );
    effacerErreurBloc(blocId);
  }

  /** Modifie des champs du document (titre, slug…) et efface leurs erreurs. */
  function changerDoc(modif: Partial<D>, fusion?: string) {
    modifier((d) => ({ ...d, ...modif }), fusion ? `doc.${fusion}` : undefined);
    const cles = Object.keys(modif);
    setErreurs((prev) => {
      if (!cles.some((k) => prev[k])) return prev;
      const copie = { ...prev };
      cles.forEach((k) => delete copie[k]);
      return copie;
    });
  }

  // ─── Erreurs ─────────────────────────────────────────────────────────
  function signalerErreurs(errs: Record<string, string[]>, ids: string[]) {
    const cles = Object.keys(errs);
    const blocErr = cles.map((k) => k.match(/^blocs\.(\d+)\./)).find(Boolean);
    if (cles.some((k) => champsDoc.includes(k))) {
      setOngletDroit("doc");
      setPanneauMobile("inspecteur");
    } else if (blocErr) {
      const blocId = ids[Number(blocErr[1])];
      if (blocId) {
        setSelectionId(blocId);
        setOngletDroit("bloc");
      }
    }
    const nb = cles.length;
    toast.error(nb > 1 ? `${nb} erreurs empêchent l'enregistrement.` : errs[cles[0]]?.[0] ?? "Données invalides.");
  }

  /** Affiche des erreurs (locales ou 422) rattachées aux blocs envoyés. */
  function appliquerErreurs(errs: Record<string, string[]>, ids: string[]) {
    setIdsEnvoyes(ids);
    setErreurs(errs);
    signalerErreurs(errs, ids);
  }

  // Erreurs rattachées aux blocs (par identifiant)
  const erreursParId = useMemo(() => {
    const r: Record<string, string> = {};
    for (const [cle, msgs] of Object.entries(erreurs)) {
      const m = cle.match(/^blocs\.(\d+)(?:\.|$)/);
      if (!m) continue;
      const blocId = idsEnvoyes[Number(m[1])];
      if (blocId && !r[blocId]) r[blocId] = msgs[0];
    }
    return r;
  }, [erreurs, idsEnvoyes]);

  const erreurGlobaleBlocs = erreurs.blocs?.[0];
  const nbErreursDoc = Object.keys(erreurs).filter((k) => champsDoc.includes(k)).length;

  // ─── Raccourcis clavier ──────────────────────────────────────────────
  const selectionRef = useRef(selectionId);
  useEffect(() => {
    selectionRef.current = selectionId;
  }, [selectionId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const touche = e.key.toLowerCase();
      if (mod && touche === "s") {
        e.preventDefault();
        sauvegardeRef.current();
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;
      // Annuler / rétablir passent par l'historique de l'éditeur, y compris pendant la saisie
      // (les frappes successives d'un même champ sont regroupées en une seule étape).
      if (mod && touche === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "retablir" : "annuler" });
        return;
      }
      if (mod && touche === "y") {
        e.preventDefault();
        dispatch({ type: "retablir" });
        return;
      }
      if (estChampSaisie(e.target)) return;
      if (e.key === "Escape") {
        setSelectionId(null);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectionRef.current) {
        e.preventDefault();
        setSuppressionId(selectionRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sauvegardeRef]);

  // ─── Protection des modifications non enregistrées ───────────────────
  useEffect(() => {
    if (!modifie) return;
    const avant = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avant);
    return () => window.removeEventListener("beforeunload", avant);
  }, [modifie]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => modifie && currentLocation.pathname !== nextLocation.pathname);

  return {
    doc,
    docRef,
    modifie,
    peutAnnuler: historique.passe.length > 0,
    peutRetablir: historique.futur.length > 0,
    annuler: () => dispatch({ type: "annuler" }),
    retablir: () => dispatch({ type: "retablir" }),
    charger,
    synchroniser,

    selectionId,
    setSelectionId,
    blocSelectionne: doc.blocs.find((b) => b.id === selectionId) ?? null,
    ongletDroit,
    setOngletDroit,
    appareil,
    setAppareil,
    glissementPalette,
    setGlissementPalette,
    ajoutIndex,
    setAjoutIndex,
    panneauMobile,
    setPanneauMobile,
    suppressionId,
    setSuppressionId,

    insererBloc,
    ajouterBloc,
    deplacerBloc,
    decaler,
    dupliquer,
    basculerMasque,
    supprimer,
    changerProp,
    changerDoc,

    erreurs,
    setErreurs,
    appliquerErreurs,
    erreursParId,
    erreurGlobaleBlocs,
    nbErreursDoc,

    blocker,
  };
}

export type EditeurBlocs<D extends DocAvecBlocs> = ReturnType<typeof useEditeurBlocs<D>>;
