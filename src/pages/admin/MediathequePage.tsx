import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Images, LoaderCircle, Search, Trash2, TriangleAlert, Upload, X } from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import {
  deleteMedia,
  formaterTaille,
  listMedias,
  TYPES_MEDIA_ACCEPTES,
  uploadMedia,
  verifierFichierMedia,
} from "../../services/mediaService";
import { lireErreur } from "../../services/pageService";
import type { Media } from "../../features/pagebuilder/types";
import { resolveImageUrl } from "../../utils/imageUrl";

interface EnvoiEnCours {
  cle: string;
  nom: string;
  pct: number;
  erreur?: string;
}

const FORMAT_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function MediathequePage() {
  const toast = useToast();
  const [medias, setMedias] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [derniere, setDerniere] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [chargementPlus, setChargementPlus] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [envois, setEnvois] = useState<EnvoiEnCours[]>([]);
  const [survol, setSurvol] = useState(false);
  const [copie, setCopie] = useState<number | null>(null);
  const [aSupprimer, setASupprimer] = useState<Media | null>(null);
  const [suppression, setSuppression] = useState(false);
  const [essai, setEssai] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const compteurGlisser = useRef(0);

  useEffect(() => {
    let annule = false;
    listMedias(1)
      .then((res) => {
        if (annule) return;
        setMedias(res.data);
        setPage(res.current_page);
        setDerniere(res.last_page);
        setTotal(res.total);
        setErreur(null);
      })
      .catch((e) => !annule && setErreur(lireErreur(e, "Impossible de charger la médiathèque.").message))
      .finally(() => !annule && setChargement(false));
    return () => {
      annule = true;
    };
  }, [essai]);

  async function chargerPlus() {
    setChargementPlus(true);
    try {
      const res = await listMedias(page + 1);
      setMedias((prev) => [...prev, ...res.data.filter((m) => !prev.some((x) => x.id === m.id))]);
      setPage(res.current_page);
      setDerniere(res.last_page);
      setTotal(res.total);
    } catch (e) {
      toast.error(lireErreur(e, "Chargement impossible.").message);
    } finally {
      setChargementPlus(false);
    }
  }

  async function importer(fichiers: FileList | File[]) {
    const liste = Array.from(fichiers);
    if (liste.length === 0) return;
    const prepares = liste.map((f, i) => ({ f, cle: `${Date.now()}-${i}-${f.name}`, erreur: verifierFichierMedia(f) }));
    setEnvois((prev) => [...prev, ...prepares.map((p) => ({ cle: p.cle, nom: p.f.name, pct: 0, erreur: p.erreur ?? undefined }))]);

    let reussis = 0;
    for (const p of prepares) {
      if (p.erreur) continue;
      try {
        const m = await uploadMedia(p.f, undefined, (pct) =>
          setEnvois((prev) => prev.map((x) => (x.cle === p.cle ? { ...x, pct } : x)))
        );
        reussis++;
        setMedias((prev) => [m, ...prev]);
        setTotal((t) => t + 1);
        setEnvois((prev) => prev.filter((x) => x.cle !== p.cle));
      } catch (e) {
        const msg = lireErreur(e, "Échec de l'envoi.").errors.fichier?.[0] ?? lireErreur(e, "Échec de l'envoi.").message;
        setEnvois((prev) => prev.map((x) => (x.cle === p.cle ? { ...x, erreur: msg } : x)));
      }
    }
    if (reussis > 0) toast.success(reussis > 1 ? `${reussis} images importées.` : "Image importée.");
  }

  async function copierUrl(m: Media) {
    const url = resolveImageUrl(m.url) ?? m.url;
    try {
      await navigator.clipboard.writeText(url);
      setCopie(m.id);
      window.setTimeout(() => setCopie((c) => (c === m.id ? null : c)), 1800);
    } catch {
      toast.error("Copie impossible : sélectionnez l'adresse manuellement.");
    }
  }

  async function confirmerSuppression() {
    if (!aSupprimer) return;
    setSuppression(true);
    try {
      await deleteMedia(aSupprimer.id);
      setMedias((prev) => prev.filter((x) => x.id !== aSupprimer.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Image supprimée.");
      setASupprimer(null);
    } catch (e) {
      toast.error(lireErreur(e, "Suppression impossible.").message);
    } finally {
      setSuppression(false);
    }
  }

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return medias;
    return medias.filter((m) => m.nom.toLowerCase().includes(q) || (m.alt ?? "").toLowerCase().includes(q));
  }, [medias, recherche]);

  return (
    <div
      className="relative mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8"
      onDragEnter={(e) => {
        if (!Array.from(e.dataTransfer.types).includes("Files")) return;
        compteurGlisser.current++;
        setSurvol(true);
      }}
      onDragLeave={() => {
        compteurGlisser.current = Math.max(0, compteurGlisser.current - 1);
        if (compteurGlisser.current === 0) setSurvol(false);
      }}
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        compteurGlisser.current = 0;
        setSurvol(false);
        void importer(e.dataTransfer.files);
      }}
    >
      {/* En-tête */}
      <div className="tely-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gray-50 text-gray-900">
            <Images size={22} />
          </div>
          <div>
            <h1 className="tely-h1">Médiathèque</h1>
            <p className="tely-subtitle mt-1">Images utilisables dans les pages du site. JPG, PNG, WebP ou GIF — 5 Mo maximum.</p>
          </div>
        </div>
        <button type="button" onClick={() => input.current?.click()} className="tely-btn self-start sm:self-auto">
          <Upload size={16} /> Importer des images
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept={TYPES_MEDIA_ACCEPTES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            if (e.target.files) void importer(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Zone de dépôt */}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          survol ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-400"
        }`}
      >
        <ImagePlus size={26} className={survol ? "text-amber-600" : "text-gray-400"} />
        <span className="mt-2 text-sm font-semibold text-gray-900">{survol ? "Déposez pour importer" : "Glissez-déposez des images ici"}</span>
        <span className="mt-0.5 text-xs text-gray-500">ou cliquez pour parcourir — plusieurs fichiers acceptés</span>
      </button>

      {/* Envois en cours */}
      {envois.length > 0 && (
        <ul className="tely-card divide-y divide-gray-100" aria-live="polite">
          {envois.map((e) => (
            <li key={e.cle} className="flex items-center gap-3 px-4 py-3">
              {e.erreur ? <TriangleAlert size={16} className="shrink-0 text-red-500" /> : <LoaderCircle size={16} className="shrink-0 animate-spin text-gray-900" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{e.nom}</p>
                {e.erreur ? (
                  <p className="tely-error">{e.erreur}</p>
                ) : (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${e.pct}%` }} />
                  </div>
                )}
              </div>
              {e.erreur && (
                <button type="button" className="tely-icon-btn p-1" aria-label="Masquer l'erreur" onClick={() => setEnvois((prev) => prev.filter((x) => x.cle !== e.cle))}>
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Recherche */}
      <div className="tely-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-gray-900 sm:max-w-md">
          <Search size={16} className="shrink-0 text-gray-900" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Filtrer par nom ou texte alternatif…"
            aria-label="Filtrer les images"
            className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
        <span className="self-end whitespace-nowrap text-xs text-gray-500 sm:self-auto">
          <span className="font-semibold text-gray-800">{total}</span> image(s)
        </span>
      </div>

      {/* Grille */}
      {chargement ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="tely-card overflow-hidden">
              <div className="aspect-[4/3] animate-pulse bg-gray-100" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : erreur ? (
        <div className="tely-card py-16 text-center text-sm text-red-500">
          {erreur}
          <button type="button" className="tely-link ml-2" onClick={() => { setChargement(true); setEssai((n) => n + 1); }}>
            Réessayer
          </button>
        </div>
      ) : filtres.length === 0 ? (
        <div className="tely-card flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Images size={22} className="text-amber-700" />
          </div>
          <p className="text-sm font-medium text-gray-700">{recherche ? "Aucune image ne correspond" : "La médiathèque est vide"}</p>
          <p className="mt-1 text-xs text-gray-400">{recherche ? "Essayez un autre terme." : "Importez vos premières images pour les utiliser dans vos pages."}</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtres.map((m) => (
              <li key={m.id} className="tely-card group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 bg-grid-pattern-subtle">
                  <img src={resolveImageUrl(m.url) ?? ""} alt={m.alt || m.nom} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/50 via-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => void copierUrl(m)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-gray-900 shadow hover:bg-white"
                      aria-label={`Copier l'adresse de ${m.nom}`}
                    >
                      {copie === m.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      {copie === m.id ? "Copiée" : "URL"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setASupprimer(m)}
                      className="inline-flex cursor-pointer items-center rounded-lg bg-white/95 p-1.5 text-red-600 shadow hover:bg-red-600 hover:text-white"
                      aria-label={`Supprimer ${m.nom}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-gray-900" title={m.nom}>
                    {m.nom}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {formaterTaille(m.taille)} · {FORMAT_DATE.format(new Date(m.created_at))}
                  </p>
                  {m.alt && <p className="mt-1 truncate text-[11px] italic text-gray-400">« {m.alt} »</p>}
                </div>
              </li>
            ))}
          </ul>
          {page < derniere && !recherche && (
            <div className="text-center">
              <button type="button" onClick={() => void chargerPlus()} disabled={chargementPlus} className="tely-btn-outline">
                {chargementPlus && <LoaderCircle size={16} className="animate-spin" />} Charger plus d'images
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={aSupprimer !== null}
        title="Supprimer cette image ?"
        description="Les pages qui l'utilisent afficheront un emplacement vide. Cette action est irréversible."
        loading={suppression}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
        variant="danger"
        onCancel={() => setASupprimer(null)}
        onConfirm={() => void confirmerSuppression()}
      />
    </div>
  );
}
