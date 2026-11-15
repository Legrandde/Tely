import { createElement } from "react";
import { Copy, Eye, EyeOff, MousePointerClick, Trash2, TriangleAlert } from "lucide-react";
import type { Bloc } from "../types";
import { REGISTRE } from "../registry";
import { ChampFormulaire } from "./Champs";

export default function Inspecteur({
  bloc,
  erreur,
  onChangerProp,
  onDupliquer,
  onBasculerMasque,
  onSupprimer,
}: {
  bloc: Bloc | null;
  erreur?: string;
  onChangerProp: (cle: string, valeur: unknown, fusion?: boolean) => void;
  onDupliquer: () => void;
  onBasculerMasque: () => void;
  onSupprimer: () => void;
}) {
  if (!bloc) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <MousePointerClick size={22} />
        </span>
        <p className="mt-4 text-sm font-semibold text-gray-900">Aucun bloc sélectionné</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Cliquez sur un bloc du canevas pour modifier son contenu, ou glissez un bloc depuis la palette.
        </p>
      </div>
    );
  }

  const def = REGISTRE[bloc.type];
  if (!def) return <p className="p-5 text-sm text-gray-500">Type de bloc inconnu.</p>;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-amber-400">
            {createElement(def.icone, { size: 18 })}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-gray-900">{def.libelle}</h2>
            <p className="truncate text-[11px] text-gray-500">{def.description}</p>
          </div>
        </div>
        {bloc.masque && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-600">
            <EyeOff size={13} /> Ce bloc est masqué sur le site public.
          </p>
        )}
        {erreur && (
          <p role="alert" className="mt-3 flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] font-medium text-red-700">
            <TriangleAlert size={13} className="mt-px shrink-0" /> {erreur}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {def.champs.map((c) =>
          c.visibleSi && !c.visibleSi(bloc.props) ? null : (
            <ChampFormulaire
              key={`${bloc.id}-${c.cle}`}
              champ={c}
              valeur={bloc.props[c.cle]}
              idBase={bloc.id}
              onChange={(v, fusion) => onChangerProp(c.cle, v, fusion)}
            />
          )
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 border-t border-gray-100 p-3">
        <button type="button" onClick={onDupliquer} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">
          <Copy size={15} /> Dupliquer
        </button>
        <button type="button" onClick={onBasculerMasque} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">
          {bloc.masque ? <Eye size={15} /> : <EyeOff size={15} />} {bloc.masque ? "Afficher" : "Masquer"}
        </button>
        <button type="button" onClick={onSupprimer} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50">
          <Trash2 size={15} /> Supprimer
        </button>
      </div>
    </div>
  );
}
