/**
 * Champs de l'inspecteur, générés à partir du schéma du registre.
 */
import { createElement, useEffect, useId, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  ImagePlus,
  Italic,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Champ } from "../registry";
import { ICONES, NOMS_ICONES, iconePour } from "../icones";
import { MAX_ELEMENTS, typeLien } from "../utils/liens";
import { cloner, txt } from "../utils/props";
import { urlEmbedVideo } from "../utils/video";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { getMatieres, getNiveaux } from "../../../services/exerciceService";
import MediaPicker from "./MediaPicker";

export type OnChangeChamp = (valeur: unknown, fusion?: boolean) => void;

const SUGGESTIONS_LIENS = [
  "/",
  "/exercices",
  "/sujets",
  "/auth/signup",
  "/auth/login",
  "/p/a-propos",
  "/p/contact",
  "/p/mentions-legales",
  "/p/cgu",
  "/p/confidentialite",
];

function Libelle({ htmlFor, children, aide }: { htmlFor?: string; children: string; aide?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-700">
        {children}
      </label>
      {aide && <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{aide}</p>}
    </div>
  );
}

const inputClasse =
  "w-full rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]";

// ─── Texte long avec mini-barre markdown ──────────────────────────────────

function ChampTextarea({
  id,
  valeur,
  onChange,
  lignes,
  placeholder,
  markdown,
}: {
  id: string;
  valeur: string;
  onChange: OnChangeChamp;
  lignes: number;
  placeholder?: string;
  markdown?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function entourer(avant: string, apres: string, defaut: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: d, selectionEnd: f } = el;
    const sel = valeur.slice(d, f) || defaut;
    const nouveau = valeur.slice(0, d) + avant + sel + apres + valeur.slice(f);
    onChange(nouveau);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(d + avant.length, d + avant.length + sel.length);
    });
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-gray-200 bg-gray-50 transition-all focus-within:border-gray-900 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]">
      {markdown && (
        <div className="flex items-center gap-0.5 border-b border-gray-200 px-1.5 py-1">
          <button type="button" className="tely-icon-btn p-1.5" title="Gras" aria-label="Gras" onClick={() => entourer("**", "**", "texte en gras")}>
            <Bold size={14} />
          </button>
          <button type="button" className="tely-icon-btn p-1.5" title="Italique" aria-label="Italique" onClick={() => entourer("*", "*", "texte en italique")}>
            <Italic size={14} />
          </button>
          <button type="button" className="tely-icon-btn p-1.5" title="Lien" aria-label="Lien" onClick={() => entourer("[", "](/adresse)", "texte du lien")}>
            <Link2 size={14} />
          </button>
        </div>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={lignes}
        value={valeur}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value, true)}
        className="block w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

// ─── Lien ─────────────────────────────────────────────────────────────────

const BADGES_LIEN = {
  interne: { libelle: "Page du site", classe: "bg-emerald-50 text-emerald-700" },
  ancre: { libelle: "Ancre", classe: "bg-gray-100 text-gray-600" },
  externe: { libelle: "Site externe · nouvel onglet", classe: "bg-sky-50 text-sky-700" },
  contact: { libelle: "Contact", classe: "bg-gray-100 text-gray-600" },
  invalide: { libelle: "Lien non autorisé", classe: "bg-red-50 text-red-600" },
} as const;

function ChampLien({ id, valeur, onChange, placeholder, cle }: { id: string; valeur: string; onChange: OnChangeChamp; placeholder?: string; cle: string }) {
  const listeId = `${id}-suggestions`;
  const t = valeur.trim() ? typeLien(valeur) : null;
  const estVideo = cle === "url";
  const videoInvalide = estVideo && !!valeur.trim() && !urlEmbedVideo(valeur);
  return (
    <div>
      <input
        id={id}
        type="text"
        inputMode="url"
        list={estVideo ? undefined : listeId}
        value={valeur}
        placeholder={placeholder ?? "/exercices ou https://…"}
        onChange={(e) => onChange(e.target.value, true)}
        aria-invalid={t === "invalide" || videoInvalide}
        className={`${inputClasse} ${t === "invalide" || videoInvalide ? "border-red-300" : ""}`}
      />
      {!estVideo && (
        <datalist id={listeId}>
          {SUGGESTIONS_LIENS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      {t && !estVideo && (
        <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGES_LIEN[t].classe}`}>
          {BADGES_LIEN[t].libelle}
        </span>
      )}
      {t === "invalide" && (
        <p className="tely-error mt-1">Utilisez http(s)://, un chemin « /… », « #ancre », mailto: ou tel:.</p>
      )}
      {videoInvalide && t !== "invalide" && (
        <p className="tely-error mt-1">Seules les vidéos YouTube et Vimeo sont prises en charge.</p>
      )}
    </div>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────

function ChampImage({ id, valeur, onChange }: { id: string; valeur: string; onChange: OnChangeChamp }) {
  const [ouvert, setOuvert] = useState(false);
  const apercu = valeur.trim() ? resolveImageUrl(valeur.trim()) : null;
  const invalide = !!valeur.trim() && typeLien(valeur) === "invalide";
  return (
    <div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="group relative flex h-16 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-900"
          aria-label={apercu ? "Changer l'image" : "Choisir une image"}
        >
          {apercu && !invalide ? (
            <img src={apercu} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-gray-400 group-hover:text-gray-900" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
          <input
            id={id}
            type="text"
            value={valeur}
            placeholder="Aucune image"
            onChange={(e) => onChange(e.target.value, true)}
            aria-invalid={invalide}
            className={`${inputClasse} py-2 text-xs ${invalide ? "border-red-300" : ""}`}
          />
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setOuvert(true)} className="flex-1 cursor-pointer rounded-lg bg-gray-900 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-gray-700">
              Médiathèque
            </button>
            {valeur && (
              <button type="button" onClick={() => onChange("")} className="cursor-pointer rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50" aria-label="Retirer l'image">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
      {invalide && <p className="tely-error mt-1">Adresse d'image non autorisée.</p>}
      <MediaPicker ouvert={ouvert} onFermer={() => setOuvert(false)} valeurActuelle={valeur} onChoisir={(url) => onChange(url)} />
    </div>
  );
}

// ─── Icône ────────────────────────────────────────────────────────────────

function ChampIcone({ valeur, onChange }: { valeur: string; onChange: OnChangeChamp }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className={`${inputClasse} flex cursor-pointer items-center gap-2 text-left`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          {createElement(iconePour(valeur), { size: 16 })}
        </span>
        <span className="flex-1">{ICONES[valeur]?.libelle ?? "Étoile"}</span>
        <ChevronDown size={14} className={`transition-transform ${ouvert ? "rotate-180" : ""}`} />
      </button>
      {ouvert && (
        <div role="listbox" aria-label="Icônes" className="mt-1.5 grid grid-cols-6 gap-1 rounded-[10px] border border-gray-200 bg-white p-1.5">
          {NOMS_ICONES.map((nom) => (
            <button
              key={nom}
              type="button"
              role="option"
              aria-selected={nom === valeur}
              title={ICONES[nom].libelle}
              onClick={() => {
                onChange(nom);
                setOuvert(false);
              }}
              className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg transition-colors ${
                nom === valeur ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-amber-50 hover:text-gray-900"
              }`}
            >
              {createElement(ICONES[nom].icone, { size: 16 })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Matière / niveau ─────────────────────────────────────────────────────

function ChampReference({ id, type, valeur, onChange }: { id: string; type: "matiere" | "niveau"; valeur: unknown; onChange: OnChangeChamp }) {
  const [options, setOptions] = useState<{ id: number; libelle: string }[] | null>(null);
  useEffect(() => {
    let annule = false;
    const p =
      type === "matiere"
        ? getMatieres().then((l) => l.map((m) => ({ id: Number(m.id), libelle: m.nom })))
        : getNiveaux().then((l) => l.map((n) => ({ id: Number(n.id), libelle: n.cycle ? `${n.libelle} (${n.cycle})` : n.libelle })));
    p.then((o) => !annule && setOptions(o)).catch(() => !annule && setOptions([]));
    return () => {
      annule = true;
    };
  }, [type]);

  const actuel = valeur === null || valeur === undefined || valeur === "" ? "" : String(valeur);
  return (
    <select
      id={id}
      value={actuel}
      disabled={options === null}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={`${inputClasse} cursor-pointer`}
    >
      <option value="">{options === null ? "Chargement…" : type === "matiere" ? "Toutes les matières" : "Tous les niveaux"}</option>
      {options?.map((o) => (
        <option key={o.id} value={String(o.id)}>
          {o.libelle}
        </option>
      ))}
    </select>
  );
}

// ─── Liste de textes ──────────────────────────────────────────────────────

function ChampTextes({ valeur, onChange, placeholder, libelleAjout, idBase }: { valeur: unknown; onChange: OnChangeChamp; placeholder?: string; libelleAjout: string; idBase: string }) {
  const liste = Array.isArray(valeur) ? valeur.map((v) => (typeof v === "string" ? v : txt(v))) : [];
  const maj = (l: string[], fusion?: boolean) => onChange(l, fusion);
  return (
    <div className="space-y-1.5">
      {liste.map((v, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            id={`${idBase}-${i}`}
            type="text"
            value={v}
            placeholder={placeholder}
            aria-label={`${placeholder ?? "Élément"} ${i + 1}`}
            onChange={(e) => maj(liste.map((x, j) => (j === i ? e.target.value : x)), true)}
            className={`${inputClasse} py-2`}
          />
          <button type="button" className="tely-icon-btn p-1.5" aria-label="Monter" disabled={i === 0} onClick={() => maj(deplacerEl(liste, i, i - 1))}>
            <ChevronUp size={14} />
          </button>
          <button type="button" className="tely-icon-btn p-1.5 hover:text-red-600" aria-label="Supprimer" onClick={() => maj(liste.filter((_, j) => j !== i))}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {liste.length < MAX_ELEMENTS && (
        <button type="button" onClick={() => maj([...liste, ""])} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-gray-900 hover:text-amber-700">
          <Plus size={13} /> {libelleAjout}
        </button>
      )}
    </div>
  );
}

function deplacerEl<T>(l: T[], de: number, vers: number): T[] {
  if (vers < 0 || vers >= l.length) return l;
  const c = [...l];
  const [x] = c.splice(de, 1);
  c.splice(vers, 0, x);
  return c;
}

// ─── Liste d'éléments répétables ──────────────────────────────────────────

function ChampListe({ champ, valeur, onChange, idBase }: { champ: Extract<Champ, { type: "list" }>; valeur: unknown; onChange: OnChangeChamp; idBase: string }) {
  const elements = (Array.isArray(valeur) ? valeur : []).map((e) =>
    e && typeof e === "object" && !Array.isArray(e) ? (e as Record<string, unknown>) : {}
  );
  const [ouvert, setOuvert] = useState<number | null>(null);
  const maj = (l: Record<string, unknown>[], fusion?: boolean) => onChange(l, fusion);

  return (
    <div className="space-y-2">
      {elements.length === 0 && <p className="rounded-[10px] bg-gray-50 px-3 py-3 text-center text-xs text-gray-400">Aucun élément.</p>}
      {elements.map((el, i) => {
        const titre = champ.titreElement?.(el) || `${champ.libelleElement} ${i + 1}`;
        const deplie = ouvert === i;
        return (
          <div key={i} className={`overflow-hidden rounded-[10px] border transition-colors ${deplie ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center gap-0.5 pr-1">
              <button
                type="button"
                onClick={() => setOuvert(deplie ? null : i)}
                aria-expanded={deplie}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2.5 text-left"
              >
                <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${deplie ? "rotate-180" : "-rotate-90"}`} />
                <span className="truncate text-xs font-semibold text-gray-800">{titre}</span>
              </button>
              <button type="button" className="tely-icon-btn p-1.5" title="Monter" aria-label={`Monter ${titre}`} disabled={i === 0} onClick={() => { maj(deplacerEl(elements, i, i - 1)); setOuvert(deplie ? i - 1 : ouvert); }}>
                <ChevronUp size={14} />
              </button>
              <button type="button" className="tely-icon-btn p-1.5" title="Descendre" aria-label={`Descendre ${titre}`} disabled={i === elements.length - 1} onClick={() => { maj(deplacerEl(elements, i, i + 1)); setOuvert(deplie ? i + 1 : ouvert); }}>
                <ChevronDown size={14} />
              </button>
              {elements.length < MAX_ELEMENTS && (
                <button type="button" className="tely-icon-btn p-1.5" title="Dupliquer" aria-label={`Dupliquer ${titre}`} onClick={() => maj([...elements.slice(0, i + 1), cloner(el), ...elements.slice(i + 1)])}>
                  <Copy size={13} />
                </button>
              )}
              <button type="button" className="tely-icon-btn p-1.5 hover:text-red-600" title="Supprimer" aria-label={`Supprimer ${titre}`} onClick={() => { maj(elements.filter((_, j) => j !== i)); setOuvert(null); }}>
                <Trash2 size={13} />
              </button>
            </div>
            {deplie && (
              <div className="space-y-3 border-t border-gray-100 px-3 pb-3 pt-3">
                {champ.champs.map((c) =>
                  c.visibleSi && !c.visibleSi(el) ? null : (
                    <ChampFormulaire
                      key={c.cle}
                      champ={c}
                      valeur={el[c.cle]}
                      idBase={`${idBase}-${i}`}
                      onChange={(v, fusion) => maj(elements.map((x, j) => (j === i ? { ...x, [c.cle]: v } : x)), fusion)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
      {elements.length < MAX_ELEMENTS ? (
        <button
          type="button"
          onClick={() => {
            maj([...elements, champ.nouvelElement()]);
            setOuvert(elements.length);
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-gray-300 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
        >
          <Plus size={14} /> Ajouter : {champ.libelleElement.toLowerCase()}
        </button>
      ) : (
        <p className="text-[11px] text-gray-400">Maximum de {MAX_ELEMENTS} éléments atteint.</p>
      )}
    </div>
  );
}

// ─── Aiguillage ───────────────────────────────────────────────────────────

export function ChampFormulaire({
  champ,
  valeur,
  onChange,
  idBase,
}: {
  champ: Champ;
  valeur: unknown;
  onChange: OnChangeChamp;
  idBase: string;
}) {
  const uid = useId();
  const id = `${idBase}-${champ.cle}-${uid}`;
  const s = typeof valeur === "string" ? valeur : valeur === null || valeur === undefined ? "" : String(valeur);

  switch (champ.type) {
    case "text":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <input id={id} type="text" value={s} placeholder={champ.placeholder} maxLength={champ.max} onChange={(e) => onChange(e.target.value, true)} className={inputClasse} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampTextarea id={id} valeur={s} onChange={onChange} lignes={champ.lignes ?? 4} placeholder={champ.placeholder} markdown={champ.markdown} />
        </div>
      );
    case "link":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampLien id={id} valeur={s} onChange={onChange} placeholder={champ.placeholder} cle={champ.cle} />
        </div>
      );
    case "image":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampImage id={id} valeur={s} onChange={onChange} />
        </div>
      );
    case "number": {
      const n = typeof valeur === "number" ? valeur : Number.parseInt(s, 10);
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <div className="flex items-center gap-3">
            <input
              id={id}
              type="range"
              min={champ.min}
              max={champ.max}
              value={Number.isFinite(n) ? n : champ.min}
              onChange={(e) => onChange(Number(e.target.value), true)}
              className="flex-1 accent-gray-900"
            />
            <span className="w-8 rounded-lg bg-gray-100 py-1 text-center text-xs font-bold text-gray-900">{Number.isFinite(n) ? n : champ.min}</span>
          </div>
        </div>
      );
    }
    case "boolean":
      return (
        <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] bg-gray-50 px-3 py-2.5">
          <span className="text-xs font-semibold text-gray-700">{champ.libelle}</span>
          <span className="relative inline-flex">
            <input id={id} type="checkbox" role="switch" checked={valeur === true} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
            <span className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-1" />
            <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
      );
    case "select":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          {champ.options.length <= 3 ? (
            <div role="radiogroup" aria-label={champ.libelle} className="flex gap-1 rounded-[10px] bg-gray-100 p-1">
              {champ.options.map((o) => (
                <button
                  key={String(o.valeur)}
                  type="button"
                  role="radio"
                  aria-checked={valeur === o.valeur}
                  onClick={() => onChange(o.valeur)}
                  className={`flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                    valeur === o.valeur ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {o.libelle}
                </button>
              ))}
            </div>
          ) : (
            <select
              id={id}
              value={String(valeur ?? "")}
              onChange={(e) => onChange(champ.options.find((o) => String(o.valeur) === e.target.value)?.valeur ?? e.target.value)}
              className={`${inputClasse} cursor-pointer`}
            >
              {champ.options.map((o) => (
                <option key={String(o.valeur)} value={String(o.valeur)}>
                  {o.libelle}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    case "icon":
      return (
        <div>
          <Libelle aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampIcone valeur={s} onChange={onChange} />
        </div>
      );
    case "matiere":
    case "niveau":
      return (
        <div>
          <Libelle htmlFor={id} aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampReference id={id} type={champ.type} valeur={valeur} onChange={onChange} />
        </div>
      );
    case "texts":
      return (
        <div>
          <Libelle aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampTextes valeur={valeur} onChange={onChange} placeholder={champ.placeholder} libelleAjout={champ.libelleAjout} idBase={id} />
        </div>
      );
    case "list":
      return (
        <div>
          <Libelle aide={champ.aide}>{champ.libelle}</Libelle>
          <ChampListe champ={champ} valeur={valeur} onChange={onChange} idBase={id} />
        </div>
      );
  }
}

