import { useMemo } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { useReferenceData } from "@/hooks/useReferenceData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const selectClass =
  "appearance-none h-9 bg-card border border-input hover:bg-secondary/50 text-foreground text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 shadow-2xs outline-none focus:border-foreground focus:ring-2 focus:ring-ring/25 cursor-pointer transition-all";

export default function ModernFilterBar({
  values,
  onChange,
  onReset,
  placeholder = "Chercher un chapitre, une notion...",
}: ModernFilterBarProps) {
  const { matieres = [], niveaux = [] } = useReferenceData();

  const cycles = useMemo(() => {
    const list = Array.from(new Set((niveaux || []).map((n) => n.cycle).filter(Boolean)));
    return list.length > 0 ? list : ["Élémentaire", "Collège", "Lycée"];
  }, [niveaux]);

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
    if (key === "cycle" && val) {
      const match = (niveaux || []).find(
        (n) =>
          String(n.id) === String(values.niveau_id) &&
          n.cycle?.toLowerCase() === val.toLowerCase()
      );
      if (!match) {
        delete next.niveau_id;
      }
    }
    onChange(next);
  }

  return (
    <div className="w-full mb-8 space-y-3">
      {/* ── 1. Champ de recherche principal ── */}
      <div className="relative w-full">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={values.q ?? ""}
          onChange={(e) => updateField("q", e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-10 bg-card"
        />
      </div>

      {/* ── 2. Filtres ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative inline-flex items-center">
          <select
            value={values.cycle ?? ""}
            onChange={(e) => updateField("cycle", e.target.value)}
            className={selectClass}
          >
            <option value="">Tous les cycles</option>
            {cycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative inline-flex items-center">
          <select
            value={values.niveau_id ?? ""}
            onChange={(e) => updateField("niveau_id", e.target.value)}
            className={selectClass}
          >
            <option value="">Tous les niveaux</option>
            {filteredNiveaux.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.libelle}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative inline-flex items-center">
          <select
            value={values.matiere_id ?? ""}
            onChange={(e) => updateField("matiere_id", e.target.value)}
            className={selectClass}
          >
            <option value="">Toutes les matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nom}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative inline-flex items-center">
          <select
            value={values.serie ?? ""}
            onChange={(e) => updateField("serie", e.target.value)}
            className={selectClass}
          >
            <option value="">Toutes les séries</option>
            {SERIES_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative inline-flex items-center">
          <select
            value={values.tri ?? "pertinence"}
            onChange={(e) => updateField("tri", e.target.value)}
            className={selectClass}
          >
            {TRI_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onReset) onReset();
              else onChange({});
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
