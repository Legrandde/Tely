import { createElement, useMemo, useState } from "react";
import { GripVertical, Search } from "lucide-react";
import type { TypeBloc } from "../types";
import { CATEGORIES, REGISTRE, TYPES_BLOCS } from "../registry";
import { MIME_NOUVEAU } from "./dnd";

function normaliser(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Liste des types de blocs groupés par catégorie, filtrable. */
export function ListeTypesBlocs({
  recherche,
  onChoisir,
  glissable = false,
  compact = false,
  onDebutGlisser,
  onFinGlisser,
}: {
  recherche: string;
  onChoisir: (type: TypeBloc) => void;
  glissable?: boolean;
  compact?: boolean;
  onDebutGlisser?: (type: TypeBloc) => void;
  onFinGlisser?: () => void;
}) {
  const groupes = useMemo(() => {
    const q = normaliser(recherche.trim());
    return CATEGORIES.map((cat) => ({
      cat,
      types: TYPES_BLOCS.filter((t) => {
        const d = REGISTRE[t];
        if (d.categorie !== cat) return false;
        if (!q) return true;
        return normaliser(`${d.libelle} ${d.description} ${cat}`).includes(q);
      }),
    })).filter((g) => g.types.length > 0);
  }, [recherche]);

  if (groupes.length === 0) {
    return <p className="px-2 py-8 text-center text-xs text-gray-400">Aucun bloc ne correspond à « {recherche} ».</p>;
  }

  return (
    <div className="space-y-5">
      {groupes.map((g) => (
        <section key={g.cat} aria-label={g.cat}>
          <h3 className="tely-overline mb-2 px-1">{g.cat}</h3>
          <ul className={compact ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "space-y-1.5"}>
            {g.types.map((t) => {
              const d = REGISTRE[t];
              return (
                <li key={t}>
                  <button
                    type="button"
                    draggable={glissable}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(MIME_NOUVEAU, t);
                      e.dataTransfer.setData("text/plain", d.libelle);
                      e.dataTransfer.effectAllowed = "copy";
                      onDebutGlisser?.(t);
                    }}
                    onDragEnd={() => onFinGlisser?.()}
                    onClick={() => onChoisir(t)}
                    title={glissable ? "Cliquez pour ajouter, ou glissez sur le canevas" : undefined}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-left transition-all hover:border-gray-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:cursor-grabbing"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition-colors group-hover:bg-gray-900 group-hover:text-amber-400">
                      {createElement(d.icone, { size: 17 })}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-gray-900">{d.libelle}</span>
                      <span className="block truncate text-[11px] text-gray-500">{d.description}</span>
                    </span>
                    {glissable && <GripVertical size={14} className="shrink-0 text-gray-300 group-hover:text-gray-500" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function Palette({
  onAjouter,
  onDebutGlisser,
  onFinGlisser,
}: {
  onAjouter: (type: TypeBloc) => void;
  onDebutGlisser: (type: TypeBloc) => void;
  onFinGlisser: () => void;
}) {
  const [recherche, setRecherche] = useState("");
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 p-3">
        <div className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-2.5 transition-all focus-within:border-gray-900 focus-within:bg-white">
          <Search size={15} className="shrink-0 text-gray-400" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un bloc…"
            aria-label="Rechercher un bloc"
            className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ListeTypesBlocs recherche={recherche} onChoisir={onAjouter} glissable onDebutGlisser={onDebutGlisser} onFinGlisser={onFinGlisser} />
      </div>
      <p className="border-t border-gray-100 px-3 py-2.5 text-[11px] leading-snug text-gray-400">
        Astuce : glissez un bloc sur le canevas pour le placer précisément.
      </p>
    </div>
  );
}
