import { useState } from "react";
import { Search } from "lucide-react";
import type { TypeBloc } from "../types";
import Dialogue from "./Dialogue";
import { ListeTypesBlocs } from "./Palette";

export default function AjoutBlocModal({
  ouvert,
  onFermer,
  onChoisir,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onChoisir: (type: TypeBloc) => void;
}) {
  const [recherche, setRecherche] = useState("");
  return (
    <Dialogue ouvert={ouvert} onFermer={onFermer} titre="Ajouter un bloc" sousTitre="Choisissez le type de section à insérer à cet endroit.">
      <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-gray-900 focus-within:bg-white">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          data-autofocus
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher (ex. FAQ, tarifs, image…)"
          aria-label="Rechercher un bloc"
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
        />
      </div>
      <ListeTypesBlocs
        recherche={recherche}
        compact
        onChoisir={(t) => {
          onChoisir(t);
          setRecherche("");
        }}
      />
    </Dialogue>
  );
}
