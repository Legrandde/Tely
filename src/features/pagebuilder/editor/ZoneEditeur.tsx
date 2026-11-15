/**
 * Briques d'interface communes aux éditeurs à blocs (page builder, articles du blog) :
 * zone palette / canevas / inspecteur, sélecteur d'aperçu, annuler / rétablir,
 * indicateur d'enregistrement, écrans de chargement et d'erreur.
 */
import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CircleDot, Monitor, Redo2, SlidersHorizontal, Smartphone, Tablet, TriangleAlert, Undo2, X } from "lucide-react";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { REGISTRE } from "../registry";
import type { Appareil, DocAvecBlocs } from "./etat";
import type { EditeurBlocs } from "./useEditeurBlocs";
import Canevas from "./Canevas";
import Palette from "./Palette";
import Inspecteur from "./Inspecteur";
import AjoutBlocModal from "./AjoutBlocModal";

// ─── Écrans de chargement / d'erreur ──────────────────────────────────────

export function EditeurSquelette() {
  return (
    <div className="flex h-screen flex-col bg-gray-100 font-sans">
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
        <div className="ml-auto h-9 w-28 animate-pulse rounded-[10px] bg-gray-100" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 border-r border-gray-200 bg-white p-3 lg:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-2 h-14 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="mx-auto h-full max-w-5xl animate-pulse rounded-xl bg-white" />
        </div>
        <div className="hidden w-80 border-l border-gray-200 bg-white xl:block" />
      </div>
    </div>
  );
}

export function EditeurErreur({ message, retour, libelleRetour }: { message: string; retour: string; libelleRetour: string }) {
  return (
    <div className="tely-page flex min-h-screen items-center justify-center p-4">
      <div className="tely-card max-w-md p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <TriangleAlert size={22} />
        </span>
        <h1 className="tely-title mt-4 text-xl">Impossible d'ouvrir l'éditeur</h1>
        <p className="tely-subtitle mt-2">{message}</p>
        <Link to={retour} className="tely-btn mt-6">
          <ArrowLeft size={16} /> {libelleRetour}
        </Link>
      </div>
    </div>
  );
}

// ─── Barre supérieure ─────────────────────────────────────────────────────

const APPAREILS: { id: Appareil; libelle: string; icone: typeof Monitor }[] = [
  { id: "desktop", libelle: "Ordinateur", icone: Monitor },
  { id: "tablette", libelle: "Tablette (768 px)", icone: Tablet },
  { id: "mobile", libelle: "Mobile (375 px)", icone: Smartphone },
];

export function SelecteurAppareil({ appareil, onChanger }: { appareil: Appareil; onChanger: (a: Appareil) => void }) {
  return (
    <div role="radiogroup" aria-label="Largeur d'aperçu" className="hidden items-center rounded-lg bg-gray-100 p-0.5 md:flex">
      {APPAREILS.map((a) => (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={appareil === a.id}
          title={a.libelle}
          aria-label={a.libelle}
          onClick={() => onChanger(a.id)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
            appareil === a.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <a.icone size={16} />
        </button>
      ))}
    </div>
  );
}

export function BoutonsHistorique<D extends DocAvecBlocs>({ e }: { e: EditeurBlocs<D> }) {
  return (
    <div className="flex items-center">
      <button type="button" className="tely-icon-btn disabled:opacity-30" disabled={!e.peutAnnuler} onClick={e.annuler} title="Annuler (Ctrl+Z)" aria-label="Annuler">
        <Undo2 size={17} />
      </button>
      <button type="button" className="tely-icon-btn disabled:opacity-30" disabled={!e.peutRetablir} onClick={e.retablir} title="Rétablir (Ctrl+Maj+Z)" aria-label="Rétablir">
        <Redo2 size={17} />
      </button>
    </div>
  );
}

export function EtatEnregistrement({ modifie, majLe }: { modifie: boolean; majLe: string | null }) {
  return (
    <span className="hidden items-center gap-1 text-[11px] text-gray-500 md:inline-flex" aria-live="polite">
      {modifie ? (
        <>
          <CircleDot size={12} className="text-amber-500" /> Modifications non enregistrées
        </>
      ) : (
        <>
          <Check size={12} className="text-emerald-600" /> Enregistré
          {majLe && ` · ${new Date(majLe).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
        </>
      )}
    </span>
  );
}

// ─── Zone palette / canevas / inspecteur ──────────────────────────────────

interface ZoneEditeurProps<D extends DocAvecBlocs> {
  e: EditeurBlocs<D>;
  /** Onglet « document » du panneau de droite (paramètres de la page, de l'article…). */
  ongletDoc: { libelle: string; libelleCourt: string; icone: ComponentType<{ size?: number }> };
  panneauDoc: ReactNode;
  libelleCanevas: string;
  /** « de la page », « de l'article » (message de confirmation de suppression d'un bloc). */
  complementDoc: string;
  entete?: ReactNode;
  messageVide?: { titre: string; texte: string };
}

export function ZoneEditeur<D extends DocAvecBlocs>({ e, ongletDoc, panneauDoc, libelleCanevas, complementDoc, entete, messageVide }: ZoneEditeurProps<D>) {
  const { doc, blocSelectionne, erreursParId } = e;

  const panneauDroit = (
    <div className="flex h-full flex-col">
      <div role="tablist" aria-label="Panneau de droite" className="flex shrink-0 gap-1 border-b border-gray-100 p-2">
        {(
          [
            { id: "bloc", libelle: "Bloc", icone: SlidersHorizontal, badge: blocSelectionne && erreursParId[blocSelectionne.id] ? 1 : 0 },
            { id: "doc", libelle: ongletDoc.libelleCourt, icone: ongletDoc.icone, badge: e.nbErreursDoc },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={e.ongletDroit === o.id}
            aria-label={o.id === "doc" ? ongletDoc.libelle : undefined}
            onClick={() => e.setOngletDroit(o.id)}
            className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
              e.ongletDroit === o.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <o.icone size={14} /> <span className="truncate">{o.libelle}</span>
            {o.badge > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-label="Erreurs" />}
          </button>
        ))}
        <button type="button" onClick={() => e.setPanneauMobile(null)} className="tely-icon-btn xl:hidden" aria-label="Fermer le panneau">
          <X size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {e.ongletDroit === "bloc" ? (
          <Inspecteur
            bloc={blocSelectionne}
            erreur={blocSelectionne ? erreursParId[blocSelectionne.id] : undefined}
            onChangerProp={(cle, v, fusion) => blocSelectionne && e.changerProp(blocSelectionne.id, cle, v, fusion)}
            onDupliquer={() => blocSelectionne && e.dupliquer(blocSelectionne.id)}
            onBasculerMasque={() => blocSelectionne && e.basculerMasque(blocSelectionne.id)}
            onSupprimer={() => blocSelectionne && e.setSuppressionId(blocSelectionne.id)}
          />
        ) : (
          panneauDoc
        )}
      </div>
    </div>
  );

  return (
    <>
      {e.erreurGlobaleBlocs && (
        <div role="alert" className="flex items-center gap-2 bg-red-500 px-4 py-2 text-xs font-semibold text-white">
          <TriangleAlert size={14} /> {e.erreurGlobaleBlocs}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* ── Palette ─────────────────────────────────────────────────── */}
        <aside
          aria-label="Palette de blocs"
          className={`${e.panneauMobile === "palette" ? "fixed inset-y-0 left-0 z-50 w-80 max-w-[88vw] shadow-2xl" : "hidden"} shrink-0 border-r border-gray-200 bg-white lg:static lg:z-auto lg:block lg:w-72 lg:shadow-none`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 lg:hidden">
            <span className="text-sm font-bold">Ajouter un bloc</span>
            <button type="button" className="tely-icon-btn" onClick={() => e.setPanneauMobile(null)} aria-label="Fermer la palette">
              <X size={16} />
            </button>
          </div>
          <div className="h-full lg:h-full">
            <Palette
              onAjouter={e.ajouterBloc}
              onDebutGlisser={(t) => {
                e.setGlissementPalette(t);
                e.setPanneauMobile(null);
              }}
              onFinGlisser={() => e.setGlissementPalette(null)}
            />
          </div>
        </aside>

        {/* ── Canevas ─────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-y-auto" aria-label={libelleCanevas}>
          <Canevas
            blocs={doc.blocs}
            selectionId={e.selectionId}
            erreursParId={erreursParId}
            appareil={e.appareil}
            glissementPalette={e.glissementPalette}
            entete={entete}
            messageVide={messageVide}
            onSelectionner={(blocId) => {
              e.setSelectionId(blocId);
              if (blocId) e.setOngletDroit("bloc");
            }}
            onDeplacer={e.deplacerBloc}
            onInserer={e.insererBloc}
            onOuvrirAjout={e.setAjoutIndex}
            onMonter={(b) => e.decaler(b, -1)}
            onDescendre={(b) => e.decaler(b, 1)}
            onDupliquer={e.dupliquer}
            onBasculerMasque={e.basculerMasque}
            onSupprimer={e.setSuppressionId}
          />
        </main>

        {/* ── Inspecteur / paramètres ─────────────────────────────────── */}
        <aside
          aria-label="Inspecteur"
          className={`${e.panneauMobile === "inspecteur" ? "fixed inset-y-0 right-0 z-50 w-96 max-w-[92vw] shadow-2xl" : "hidden"} shrink-0 border-l border-gray-200 bg-white xl:static xl:z-auto xl:block xl:w-80 xl:shadow-none`}
        >
          {panneauDroit}
        </aside>

        {e.panneauMobile && (
          <div className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden xl:hidden" onClick={() => e.setPanneauMobile(null)} aria-hidden="true" />
        )}
      </div>

      <AjoutBlocModal
        ouvert={e.ajoutIndex !== null}
        onFermer={() => e.setAjoutIndex(null)}
        onChoisir={(t) => {
          if (e.ajoutIndex !== null) e.insererBloc(t, e.ajoutIndex);
          e.setAjoutIndex(null);
        }}
      />

      <ConfirmModal
        open={e.suppressionId !== null}
        title="Supprimer ce bloc ?"
        description={`Le bloc « ${REGISTRE[doc.blocs.find((b) => b.id === e.suppressionId)?.type ?? "texte"]?.libelle ?? ""} » sera retiré ${complementDoc}. Vous pourrez annuler avec Ctrl+Z.`}
        confirmLabel="Supprimer"
        variant="danger"
        onCancel={() => e.setSuppressionId(null)}
        onConfirm={() => e.suppressionId && e.supprimer(e.suppressionId)}
      />

      <ConfirmModal
        open={e.blocker.state === "blocked"}
        title="Quitter sans enregistrer ?"
        description="Vos modifications non enregistrées seront perdues."
        confirmLabel="Quitter quand même"
        cancelLabel="Rester sur la page"
        variant="warning"
        onCancel={() => e.blocker.reset?.()}
        onConfirm={() => e.blocker.proceed?.()}
      />
    </>
  );
}
