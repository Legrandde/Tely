import { useMemo } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { useReferenceData } from "../hooks/useReferenceData";

export interface FilterValues {
  q?: string;
  cycle?: string;
  niveau_id?: string;
  matiere_id?: string;
  serie?: string;
  tri?: string;
}

interface ModernFilterBarProps {
  values: FilterValues;
  onChange: (newValues: FilterValues) => void;
  onReset?: () => void;
  placeholder?: string;
}

const SERIES_OPTIONS = [
  { value: "SM", label: "Sciences Mathématiques (SM)" },
  { value: "SE", label: "Sciences Expérimentales (SE)" },
  { value: "SS", label: "Sciences Sociales (SS)" },
  { value: "FA", label: "Franco-Arabe" },
  { value: "GEN", label: "Enseignement Général" },
];

const TRI_OPTIONS = [
  { value: "pertinence", label: "Trier : pertinence" },
  { value: "recent", label: "Trier : plus récents" },
  { value: "difficulte_asc", label: "Trier : difficulté croissante" },
  { value: "difficulte_desc", label: "Trier : difficulté décroissante" },
  { value: "titre_asc", label: "Trier : titre A-Z" },
];

export default function ModernFilterBar({
  values,
  onChange,
  onReset,
  placeholder = "Chercher un chapitre, une notion...",
}: ModernFilterBarProps) {
  const { matieres = [], niveaux = [] } = useReferenceData();

  // Liste unique des cycles
  const cycles = useMemo(() => {
    const list = Array.from(new Set((niveaux || []).map((n) => n.cycle).filter(Boolean)));
    return list.length > 0 ? list : ["Élémentaire", "Collège", "Lycée"];
  }, [niveaux]);

  // Niveaux filtrés par cycle si un cycle est choisi
  const filteredNiveaux = useMemo(() => {
    if (!values.cycle) return niveaux || [];
    return (niveaux || []).filter(
      (n) => n.cycle?.toLowerCase() === values.cycle?.toLowerCase()
    );
  }, [niveaux, values.cycle]);

  const hasActiveFilters = Boolean(
    values.q ||
    values.cycle ||
    values.niveau_id ||
    values.matiere_id ||
    values.serie ||
    (values.tri && values.tri !== "pertinence")
  );

  function updateField(key: keyof FilterValues, val?: string) {
    const next = { ...values, [key]: val || undefined };
    // Si on change de cycle et que le niveau choisi n'est plus dedans, on le réinitialise
    if (key === "cycle" && val) {
      const match = (niveaux || []).find(
        (n) => String(n.id) === String(values.niveau_id) && n.cycle?.toLowerCase() === val.toLowerCase()
      );
      if (!match) {
        delete next.niveau_id;
      }
    }
    onChange(next);
  }

  return (
    <div className="w-full mb-8">
      {/* ── 1. Champ de recherche principal ── */}
      <div className="relative w-full mb-3.5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={values.q ?? ""}
          onChange={(e) => updateField("q", e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm text-slate-700 bg-white rounded-full border border-slate-200/90 shadow-2xs placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all"
        />
      </div>

      {/* ── 2. Ligne horizontale des filtres en pilule ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Tous les cycles */}
        <div className="relative inline-flex items-center">
          <select
            value={values.cycle ?? ""}
            onChange={(e) => updateField("cycle", e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-normal rounded-full pl-4 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-300/40 cursor-pointer transition-all"
          >
            <option value="">Tous les cycles</option>
            {cycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Tous les niveaux */}
        <div className="relative inline-flex items-center">
          <select
            value={values.niveau_id ?? ""}
            onChange={(e) => updateField("niveau_id", e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-normal rounded-full pl-4 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-300/40 cursor-pointer transition-all"
          >
            <option value="">Tous les niveaux</option>
            {filteredNiveaux.map((n) => (
              <option key={n.id} value={n.id}>
                {n.libelle}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Toutes les matières */}
        <div className="relative inline-flex items-center">
          <select
            value={values.matiere_id ?? ""}
            onChange={(e) => updateField("matiere_id", e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-normal rounded-full pl-4 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-300/40 cursor-pointer transition-all"
          >
            <option value="">Toutes les matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Toutes les séries */}
        <div className="relative inline-flex items-center">
          <select
            value={values.serie ?? ""}
            onChange={(e) => updateField("serie", e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-normal rounded-full pl-4 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-300/40 cursor-pointer transition-all"
          >
            <option value="">Toutes les séries</option>
            {SERIES_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Trier : pertinence */}
        <div className="relative inline-flex items-center">
          <select
            value={values.tri ?? "pertinence"}
            onChange={(e) => updateField("tri", e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-normal rounded-full pl-4 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-300/40 cursor-pointer transition-all"
          >
            {TRI_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Bouton Réinitialiser si des filtres sont appliqués */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              if (onReset) onReset();
              else onChange({});
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-full transition-colors cursor-pointer"
            title="Réinitialiser tous les filtres"
          >
            <RotateCcw size={12} />
            <span>Effacer les filtres</span>
          </button>
        )}
      </div>
    </div>
  );
}
