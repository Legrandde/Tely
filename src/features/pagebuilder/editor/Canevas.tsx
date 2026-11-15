import { createElement, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, LayoutTemplate, Plus, Trash2, TriangleAlert } from "lucide-react";
import type { Bloc, TypeBloc } from "../types";
import { REGISTRE } from "../registry";
import { BlocRendu } from "../PageRenderer";
import { contientDonneesBloc, MIME_DEPLACER, MIME_NOUVEAU } from "./dnd";
import { LARGEURS, type Appareil } from "./etat";


interface Props {
  blocs: Bloc[];
  selectionId: string | null;
  erreursParId: Record<string, string>;
  appareil: Appareil;
  glissementPalette: TypeBloc | null;
  onSelectionner: (id: string | null) => void;
  onDeplacer: (id: string, versIndex: number) => void;
  onInserer: (type: TypeBloc, index: number) => void;
  onOuvrirAjout: (index: number) => void;
  onMonter: (id: string) => void;
  onDescendre: (id: string) => void;
  onDupliquer: (id: string) => void;
  onBasculerMasque: (id: string) => void;
  onSupprimer: (id: string) => void;
  /** Contenu fixe affiché au-dessus des blocs (ex. en-tête d'un article du blog). */
  entete?: ReactNode;
  /** Textes de l'état vide (par défaut : « Votre page est vide »). */
  messageVide?: { titre: string; texte: string };
}

function BoutonOutil({ libelle, onClick, children, danger, disabled }: { libelle: string; onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={libelle}
      aria-label={libelle}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "text-red-300 hover:bg-red-500 hover:text-white" : "text-white/80 hover:bg-white/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** Zone d'insertion entre deux blocs : bouton « + » au survol, indicateur pendant un glisser-déposer. */
function ZoneInsertion({ index, actif, onAjouter }: { index: number; actif: boolean; onAjouter: (i: number) => void }) {
  return (
    <div className="group/zone relative z-20 h-0" data-zone={index}>
      {actif ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 -translate-y-1/2">
          <div className="relative h-1 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-900">
              Déposer ici
            </span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 top-0 flex h-4 -translate-y-1/2 items-center justify-center opacity-0 transition-opacity group-hover/zone:opacity-100 focus-within:opacity-100">
          <span aria-hidden="true" className="absolute inset-x-6 top-1/2 h-px bg-amber-400" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAjouter(index);
            }}
            aria-label={`Insérer un bloc à la position ${index + 1}`}
            className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amber-500 text-gray-900 shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Canevas(p: Props) {
  const { blocs, selectionId, erreursParId, appareil } = p;
  const [indexDepot, setIndexDepot] = useState<number | null>(null);
  const [deplaceId, setDeplaceId] = useState<string | null>(null);
  const racine = useRef<HTMLDivElement>(null);
  const largeur = LARGEURS[appareil];

  // Fait défiler jusqu'au bloc sélectionné s'il n'est pas visible
  useEffect(() => {
    if (!selectionId) return;
    const el = racine.current?.querySelector<HTMLElement>(`[data-bloc-id="${CSS.escape(selectionId)}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectionId]);

  function surSurvol(e: DragEvent, index: number) {
    if (!contientDonneesBloc(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = Array.from(e.dataTransfer.types).includes(MIME_DEPLACER) ? "move" : "copy";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cible = e.clientY < rect.top + rect.height / 2 ? index : index + 1;
    if (cible !== indexDepot) setIndexDepot(cible);
  }

  function surDepot(e: DragEvent) {
    if (!contientDonneesBloc(e.dataTransfer)) return;
    e.preventDefault();
    const index = indexDepot ?? blocs.length;
    const id = e.dataTransfer.getData(MIME_DEPLACER);
    const type = e.dataTransfer.getData(MIME_NOUVEAU) as TypeBloc;
    if (id) {
      const de = blocs.findIndex((b) => b.id === id);
      if (de !== -1) p.onDeplacer(id, de < index ? index - 1 : index);
    } else if (type && REGISTRE[type]) {
      p.onInserer(type, index);
    }
    setIndexDepot(null);
    setDeplaceId(null);
  }

  function debutDeplacement(e: DragEvent, bloc: Bloc) {
    e.stopPropagation();
    e.dataTransfer.setData(MIME_DEPLACER, bloc.id);
    e.dataTransfer.setData("text/plain", REGISTRE[bloc.type]?.libelle ?? bloc.type);
    e.dataTransfer.effectAllowed = "move";
    // Fantôme compact plutôt qu'une capture de toute la section
    const fantome = document.createElement("div");
    fantome.textContent = REGISTRE[bloc.type]?.libelle ?? "Bloc";
    fantome.style.cssText =
      "position:fixed;top:-100px;left:-100px;padding:8px 14px;border-radius:10px;background:#111827;color:#fff;font:600 13px 'Bricolage Grotesque',sans-serif;box-shadow:0 10px 25px rgba(0,0,0,.2)";
    document.body.appendChild(fantome);
    e.dataTransfer.setDragImage(fantome, 16, 16);
    window.setTimeout(() => fantome.remove(), 0);
    setDeplaceId(bloc.id);
  }

  const enGlissement = deplaceId !== null || p.glissementPalette !== null;

  return (
    <div
      className="min-h-full bg-gray-100 bg-grid-dots px-3 py-6 sm:px-6"
      onClick={() => p.onSelectionner(null)}
      onDragOver={(e) => {
        if (!contientDonneesBloc(e.dataTransfer)) return;
        e.preventDefault();
        if (blocs.length === 0 && indexDepot !== 0) setIndexDepot(0);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIndexDepot(null);
      }}
      onDrop={surDepot}
    >
      <div
        ref={racine}
        className="mx-auto overflow-hidden rounded-xl bg-white shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5 transition-[max-width] duration-300 ease-out"
        style={{ maxWidth: largeur ? `${largeur}px` : "100%" }}
        // Neutralise la navigation des liens dans le canevas (aperçu uniquement)
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.preventDefault();
        }}
      >
        <div className="@container w-full bg-white font-sans text-gray-900">
          {p.entete}
          {blocs.length === 0 ? (
            <div
              className={`m-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-24 text-center transition-colors ${
                indexDepot === 0 || enGlissement ? "border-amber-500 bg-amber-50" : "border-gray-200"
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <LayoutTemplate size={26} />
              </span>
              <p className="mt-4 text-base font-bold text-gray-900">{p.messageVide?.titre ?? "Votre page est vide"}</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {p.messageVide?.texte ?? "Glissez un bloc depuis la palette ou cliquez ci-dessous pour ajouter votre première section."}
              </p>
              <button
                type="button"
                className="tely-btn mt-6"
                onClick={(e) => {
                  e.stopPropagation();
                  p.onOuvrirAjout(0);
                }}
              >
                <Plus size={16} /> Ajouter un bloc
              </button>
            </div>
          ) : (
            <>
              {blocs.map((bloc, i) => {
                const def = REGISTRE[bloc.type];
                const selectionne = bloc.id === selectionId;
                const erreur = erreursParId[bloc.id];
                const vide = def?.estVide(bloc.props) ?? false;
                return (
                  <div key={bloc.id}>
                    <ZoneInsertion index={i} actif={indexDepot === i} onAjouter={p.onOuvrirAjout} />
                    <div
                      data-bloc-id={bloc.id}
                      role="group"
                      tabIndex={0}
                      aria-label={`Bloc ${i + 1} : ${def?.libelle ?? bloc.type}${bloc.masque ? " (masqué)" : ""}`}
                      aria-current={selectionne ? "true" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        p.onSelectionner(bloc.id);
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                          e.preventDefault();
                          p.onSelectionner(bloc.id);
                        }
                      }}
                      onDragOver={(e) => surSurvol(e, i)}
                      onDrop={(e) => {
                        e.stopPropagation();
                        surDepot(e);
                      }}
                      className={`group/bloc relative outline-none transition-opacity ${deplaceId === bloc.id ? "opacity-40" : ""}`}
                    >
                      {/* Contour de sélection / survol / erreur */}
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 z-10 transition-all ${
                          erreur
                            ? "ring-2 ring-inset ring-red-500"
                            : selectionne
                              ? "ring-2 ring-inset ring-amber-500"
                              : "group-hover/bloc:ring-1 group-hover/bloc:ring-inset group-hover/bloc:ring-amber-400/70 group-focus-visible/bloc:ring-2 group-focus-visible/bloc:ring-inset group-focus-visible/bloc:ring-gray-900"
                        }`}
                      />

                      {/* Étiquette */}
                      <span
                        className={`pointer-events-none absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-opacity ${
                          erreur ? "bg-red-500 text-white" : "bg-amber-500 text-gray-900"
                        } ${selectionne || erreur ? "opacity-100" : "opacity-0 group-hover/bloc:opacity-100"}`}
                      >
                        {erreur ? <TriangleAlert size={11} /> : def && createElement(def.icone, { size: 11 })}
                        {def?.libelle ?? bloc.type}
                        {bloc.masque && " · masqué"}
                      </span>

                      {/* Barre d'outils flottante */}
                      {selectionne && (
                        <div
                          className="absolute right-2 top-2 z-30 flex items-center gap-0.5 rounded-lg bg-gray-900 p-1 shadow-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            draggable
                            onDragStart={(e) => debutDeplacement(e, bloc)}
                            onDragEnd={() => {
                              setDeplaceId(null);
                              setIndexDepot(null);
                            }}
                            title="Glisser pour déplacer"
                            aria-label="Glisser pour déplacer"
                            className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-white/80 hover:bg-white/15 active:cursor-grabbing"
                          >
                            <GripVertical size={15} />
                          </span>
                          <BoutonOutil libelle="Monter" disabled={i === 0} onClick={() => p.onMonter(bloc.id)}>
                            <ArrowUp size={15} />
                          </BoutonOutil>
                          <BoutonOutil libelle="Descendre" disabled={i === blocs.length - 1} onClick={() => p.onDescendre(bloc.id)}>
                            <ArrowDown size={15} />
                          </BoutonOutil>
                          <BoutonOutil libelle="Dupliquer" onClick={() => p.onDupliquer(bloc.id)}>
                            <Copy size={14} />
                          </BoutonOutil>
                          <BoutonOutil libelle={bloc.masque ? "Afficher sur le site" : "Masquer sur le site"} onClick={() => p.onBasculerMasque(bloc.id)}>
                            {bloc.masque ? <Eye size={15} /> : <EyeOff size={15} />}
                          </BoutonOutil>
                          <span className="mx-0.5 h-4 w-px bg-white/20" aria-hidden="true" />
                          <BoutonOutil libelle="Supprimer" danger onClick={() => p.onSupprimer(bloc.id)}>
                            <Trash2 size={14} />
                          </BoutonOutil>
                        </div>
                      )}

                      {erreur && (
                        <p role="alert" className="absolute inset-x-2 bottom-2 z-20 rounded-md bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow">
                          {erreur}
                        </p>
                      )}

                      <div className={bloc.masque ? "opacity-40 [filter:grayscale(0.6)]" : ""}>
                        {vide ? (
                          <div className="m-3 flex min-h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                            {def && createElement(def.icone, { size: 22, className: "text-gray-400" })}
                            <p className="mt-2 text-sm font-semibold text-gray-600">{def?.libelle} vide</p>
                            <p className="text-xs text-gray-400">Complétez ce bloc dans l'inspecteur — il n'apparaîtra pas tant qu'il est vide.</p>
                          </div>
                        ) : (
                          <BlocRendu bloc={bloc} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <ZoneInsertion index={blocs.length} actif={indexDepot === blocs.length} onAjouter={p.onOuvrirAjout} />
              <div
                className={`flex justify-center px-4 py-8 transition-colors ${enGlissement ? "bg-amber-50/60" : ""}`}
                onDragOver={(e) => {
                  if (!contientDonneesBloc(e.dataTransfer)) return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (indexDepot !== blocs.length) setIndexDepot(blocs.length);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  surDepot(e);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onOuvrirAjout(blocs.length);
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                  <Plus size={16} /> Ajouter un bloc à la fin
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
