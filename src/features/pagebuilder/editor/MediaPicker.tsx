import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Images, Link2, LoaderCircle, Upload } from "lucide-react";
import Dialogue from "./Dialogue";
import type { Media } from "../types";
import { formaterTaille, listMedias, TYPES_MEDIA_ACCEPTES, uploadMedia, verifierFichierMedia } from "../../../services/mediaService";
import { lireErreur } from "../../../services/pageService";
import { lienSur } from "../utils/liens";
import { resolveImageUrl } from "../../../utils/imageUrl";

type Onglet = "bibliotheque" | "importer" | "url";

export default function MediaPicker({
  ouvert,
  onFermer,
  onChoisir,
  valeurActuelle,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onChoisir: (url: string, media?: Media) => void;
  valeurActuelle?: string;
}) {
  const [onglet, setOnglet] = useState<Onglet>("bibliotheque");
  const [medias, setMedias] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [derniere, setDerniere] = useState(1);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selection, setSelection] = useState<Media | null>(null);
  const [url, setUrl] = useState("");
  const [envoi, setEnvoi] = useState<{ nom: string; pct: number } | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const inputFichier = useRef<HTMLInputElement>(null);
  const charge = useRef(false);

  const charger = useCallback((p: number) => {
    setChargement(true);
    setErreur(null);
    listMedias(p)
      .then((res) => {
        setMedias((prev) => (p === 1 ? res.data : [...prev, ...res.data.filter((m) => !prev.some((x) => x.id === m.id))]));
        setPage(res.current_page);
        setDerniere(res.last_page);
      })
      .catch((e) => setErreur(lireErreur(e, "Impossible de charger la médiathèque.").message))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    if (!ouvert || charge.current) return;
    charge.current = true;
    queueMicrotask(() => charger(1));
  }, [ouvert, charger]);

  async function importer(fichiers: FileList | File[]) {
    const liste = Array.from(fichiers);
    if (liste.length === 0) return;
    setErreurEnvoi(null);
    let dernier: Media | null = null;
    for (const f of liste) {
      const err = verifierFichierMedia(f);
      if (err) {
        setErreurEnvoi(err);
        continue;
      }
      setEnvoi({ nom: f.name, pct: 0 });
      try {
        const m = await uploadMedia(f, undefined, (pct) => setEnvoi({ nom: f.name, pct }));
        dernier = m;
        setMedias((prev) => [m, ...prev]);
      } catch (e) {
        setErreurEnvoi(lireErreur(e, `Échec de l'envoi de « ${f.name} ».`).message);
      }
    }
    setEnvoi(null);
    if (dernier) {
      setSelection(dernier);
      setOnglet("bibliotheque");
    }
  }

  const urlValide = url.trim() !== "" && lienSur(url);

  function valider() {
    if (onglet === "url") {
      if (!urlValide) return;
      onChoisir(url.trim());
    } else if (selection) {
      onChoisir(selection.url, selection);
    } else return;
    setSelection(null);
    setUrl("");
    onFermer();
  }

  const peutValider = onglet === "url" ? urlValide : !!selection;

  const onglets: { id: Onglet; libelle: string; icone: typeof Images }[] = [
    { id: "bibliotheque", libelle: "Médiathèque", icone: Images },
    { id: "importer", libelle: "Importer", icone: Upload },
    { id: "url", libelle: "Adresse web", icone: Link2 },
  ];

  return (
    <Dialogue
      ouvert={ouvert}
      onFermer={onFermer}
      titre="Choisir une image"
      sousTitre="Sélectionnez un média existant, importez un fichier ou collez une adresse."
      largeur="max-w-4xl"
      pied={
        <>
          <button type="button" className="tely-btn-outline py-2.5" onClick={onFermer}>
            Annuler
          </button>
          <button type="button" className="tely-btn py-2.5" disabled={!peutValider} onClick={valider}>
            <Check size={16} /> Utiliser cette image
          </button>
        </>
      }
    >
      <div role="tablist" aria-label="Source de l'image" className="mb-5 inline-flex rounded-xl bg-gray-100 p-1">
        {onglets.map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={onglet === o.id}
            onClick={() => setOnglet(o.id)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              onglet === o.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <o.icone size={15} /> {o.libelle}
          </button>
        ))}
      </div>

      {onglet === "bibliotheque" && (
        <div role="tabpanel">
          {erreur ? (
            <div className="rounded-xl bg-red-50 p-6 text-center text-sm text-red-600">
              {erreur}
              <button type="button" className="tely-link ml-2" onClick={() => charger(1)}>
                Réessayer
              </button>
            </div>
          ) : medias.length === 0 && chargement ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : medias.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
              <ImagePlus size={28} className="text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-600">La médiathèque est vide</p>
              <button type="button" className="tely-link mt-2 text-sm" onClick={() => setOnglet("importer")}>
                Importer une première image
              </button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {medias.map((m) => {
                  const actif = selection?.id === m.id;
                  const courant = !selection && valeurActuelle === m.url;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setSelection(m)}
                        onDoubleClick={() => {
                          onChoisir(m.url, m);
                          onFermer();
                        }}
                        aria-pressed={actif}
                        title={m.nom}
                        className={`group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100 ring-offset-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                          actif ? "ring-2 ring-gray-900" : courant ? "ring-2 ring-amber-400" : "hover:ring-2 hover:ring-gray-200"
                        }`}
                      >
                        <img src={resolveImageUrl(m.url) ?? ""} alt={m.alt || m.nom} loading="lazy" className="h-full w-full object-cover" />
                        {actif && (
                          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white">
                            <Check size={14} />
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {m.nom} · {formaterTaille(m.taille)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {page < derniere && (
                <div className="mt-5 text-center">
                  <button type="button" className="tely-btn-outline py-2.5" disabled={chargement} onClick={() => charger(page + 1)}>
                    {chargement ? <LoaderCircle size={16} className="animate-spin" /> : null} Charger plus
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {onglet === "importer" && (
        <div role="tabpanel">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setSurvol(true);
            }}
            onDragLeave={() => setSurvol(false)}
            onDrop={(e) => {
              e.preventDefault();
              setSurvol(false);
              void importer(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
              survol ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            {envoi ? (
              <>
                <LoaderCircle size={28} className="animate-spin text-gray-900" />
                <p className="mt-3 text-sm font-medium text-gray-700">Envoi de « {envoi.nom} »…</p>
                <div className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${envoi.pct}%` }} />
                </div>
              </>
            ) : (
              <>
                <Upload size={28} className="text-gray-900" />
                <p className="mt-3 text-sm font-semibold text-gray-900">Glissez-déposez vos images ici</p>
                <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP ou GIF — 5 Mo maximum</p>
                <button type="button" className="tely-btn mt-5 py-2.5" onClick={() => inputFichier.current?.click()}>
                  Parcourir les fichiers
                </button>
              </>
            )}
            <input
              ref={inputFichier}
              type="file"
              accept={TYPES_MEDIA_ACCEPTES.join(",")}
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                if (e.target.files) void importer(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {erreurEnvoi && <p className="tely-error mt-3" role="alert">{erreurEnvoi}</p>}
        </div>
      )}

      {onglet === "url" && (
        <div role="tabpanel" className="space-y-3">
          <label className="block">
            <span className="tely-label">Adresse de l'image</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") valider();
              }}
              placeholder="https://exemple.com/image.jpg"
              className="tely-input mt-1.5"
            />
          </label>
          {url.trim() && !urlValide && (
            <p className="tely-error">Adresse non autorisée : utilisez http(s):// ou un chemin commençant par « / ».</p>
          )}
          {urlValide && (
            <div className="overflow-hidden rounded-xl bg-gray-50 p-3">
              <img src={resolveImageUrl(url.trim()) ?? ""} alt="Aperçu" className="mx-auto max-h-64 rounded-lg object-contain" />
            </div>
          )}
        </div>
      )}
    </Dialogue>
  );
}
