import { useState } from "react";
import { Hash, Plus, X } from "lucide-react";
import { LONGUEUR_TAG_MAX, MAX_TAGS } from "./etatArticle";

function normaliserTag(t: string) {
  return t.trim().replace(/^#+/, "").replace(/\s+/g, " ").toLowerCase().slice(0, LONGUEUR_TAG_MAX);
}

/** Saisie de mots-clés en puces (Entrée ou virgule pour valider, Retour arrière pour retirer). */
export default function SaisieTags({
  id,
  tags,
  suggestions,
  onChanger,
  invalide,
  describedBy,
}: {
  id: string;
  tags: string[];
  suggestions: string[];
  onChanger: (tags: string[]) => void;
  invalide?: boolean;
  describedBy?: string;
}) {
  const [saisie, setSaisie] = useState("");
  const plein = tags.length >= MAX_TAGS;

  function ajouter(brut: string) {
    const nouveaux = brut
      .split(",")
      .map(normaliserTag)
      .filter(Boolean);
    if (nouveaux.length === 0) return;
    const resultat = [...tags];
    for (const t of nouveaux) {
      if (resultat.length >= MAX_TAGS) break;
      if (!resultat.includes(t)) resultat.push(t);
    }
    if (resultat.length !== tags.length) onChanger(resultat);
    setSaisie("");
  }

  const proposes = suggestions.filter((s) => !tags.includes(s)).slice(0, 8);

  return (
    <div>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-1.5 rounded-[10px] border bg-gray-50 px-2 py-1.5 transition-all focus-within:border-gray-900 focus-within:bg-white ${
          invalide ? "border-red-300" : "border-gray-200"
        }`}
      >
        <ul className="contents" aria-label="Mots-clés ajoutés">
          {tags.map((t) => (
            <li key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-900 py-0.5 pl-2.5 pr-1 text-xs font-semibold text-white">
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => onChanger(tags.filter((x) => x !== t))}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-amber-400"
                aria-label={`Retirer le mot-clé ${t}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
        <input
          id={id}
          type="text"
          value={saisie}
          disabled={plein}
          maxLength={LONGUEUR_TAG_MAX + 5}
          aria-invalid={invalide || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) ajouter(v);
            else setSaisie(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ajouter(saisie);
            } else if (e.key === "Backspace" && !saisie && tags.length > 0) {
              onChanger(tags.slice(0, -1));
            }
          }}
          onBlur={() => saisie.trim() && ajouter(saisie)}
          placeholder={plein ? "Limite atteinte" : tags.length ? "Ajouter…" : "brevet, méthode, maths…"}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>
      {proposes.length > 0 && !plein && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-gray-400">Populaires :</span>
          {proposes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ajouter(s)}
              className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
              aria-label={`Ajouter le mot-clé ${s}`}
            >
              <Plus size={10} aria-hidden="true" />
              <Hash size={10} aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
