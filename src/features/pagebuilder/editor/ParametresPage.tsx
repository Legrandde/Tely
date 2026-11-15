import { useId, useState } from "react";
import { House, ImagePlus, Info, PanelBottom, PanelTop, WandSparkles, X } from "lucide-react";
import type { DocEditeur } from "./etat";
import MediaPicker from "./MediaPicker";
import { erreurSlug, lienSur, SLUGS_RESERVES, slugifier } from "../utils/liens";
import { resolveImageUrl } from "../../../utils/imageUrl";

const META_CONSEILLEE = 160;

export default function ParametresPage({
  doc,
  erreurs,
  onChanger,
}: {
  doc: DocEditeur;
  erreurs: Record<string, string[]>;
  onChanger: (modif: Partial<DocEditeur>, fusion?: string) => void;
}) {
  const id = useId();
  const [picker, setPicker] = useState(false);
  const [aideSlug, setAideSlug] = useState(false);
  const errSlugLocale = erreurSlug(doc.slug);
  const errSlug = erreurs.slug?.[0] ?? errSlugLocale;
  const nbMeta = [...doc.meta_description].length;
  const ogInvalide = !!doc.image_og && !lienSur(doc.image_og);
  const origine = typeof window !== "undefined" ? window.location.host : "tely.com";

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Titre */}
      <div>
        <label htmlFor={`${id}-titre`} className="mb-1.5 block text-xs font-semibold text-gray-700">
          Titre de la page
        </label>
        <input
          id={`${id}-titre`}
          type="text"
          maxLength={150}
          value={doc.titre}
          onChange={(e) => onChanger({ titre: e.target.value }, "titre")}
          className="tely-input py-2.5"
        />
        {erreurs.titre && <p className="tely-error mt-1">{erreurs.titre[0]}</p>}
      </div>

      {/* Slug */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={`${id}-slug`} className="text-xs font-semibold text-gray-700">
            Adresse (slug)
          </label>
          <button type="button" onClick={() => setAideSlug((a) => !a)} aria-expanded={aideSlug} className="tely-icon-btn p-1" aria-label="Aide sur les adresses">
            <Info size={14} />
          </button>
        </div>
        <div className={`flex items-center overflow-hidden rounded-[10px] border bg-gray-50 transition-all focus-within:border-gray-900 focus-within:bg-white ${errSlug ? "border-red-300" : "border-gray-200"}`}>
          <span className="shrink-0 pl-3 text-sm text-gray-400">/p/</span>
          <input
            id={`${id}-slug`}
            type="text"
            maxLength={120}
            value={doc.slug}
            aria-invalid={!!errSlug}
            onChange={(e) => onChanger({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }, "slug")}
            onBlur={() => doc.slug && doc.slug !== slugifier(doc.slug) && onChanger({ slug: slugifier(doc.slug) })}
            className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-gray-900 outline-none"
          />
          <button
            type="button"
            title="Générer depuis le titre"
            aria-label="Générer l'adresse depuis le titre"
            onClick={() => onChanger({ slug: slugifier(doc.titre) })}
            className="tely-icon-btn mr-1 p-1.5"
          >
            <WandSparkles size={14} />
          </button>
        </div>
        {errSlug && <p className="tely-error mt-1">{errSlug}</p>}
        {aideSlug && (
          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-gray-700">
            Lettres minuscules, chiffres et tirets uniquement. Adresses réservées par l'application :{" "}
            <span className="font-mono text-gray-900">{SLUGS_RESERVES.join(", ")}</span>.
            {doc.est_accueil && " Cette page étant la page d'accueil, elle s'affiche aussi à la racine du site."}
          </div>
        )}
      </div>

      {/* Meta description + aperçu Google */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={`${id}-meta`} className="text-xs font-semibold text-gray-700">
            Description (référencement)
          </label>
          <span className={`text-[11px] font-semibold ${nbMeta > META_CONSEILLEE ? "text-red-600" : nbMeta > 140 ? "text-amber-600" : "text-gray-400"}`}>
            {nbMeta} / {META_CONSEILLEE}
          </span>
        </div>
        <textarea
          id={`${id}-meta`}
          rows={3}
          maxLength={300}
          value={doc.meta_description}
          onChange={(e) => onChanger({ meta_description: e.target.value }, "meta")}
          className="tely-input resize-none py-2.5"
          aria-describedby={`${id}-meta-aide`}
        />
        <p id={`${id}-meta-aide`} className="mt-1 text-[11px] text-gray-400">
          {nbMeta > META_CONSEILLEE ? "Au-delà de 160 caractères, Google tronque la description." : "Idéalement entre 120 et 160 caractères."}
        </p>
        {erreurs.meta_description && <p className="tely-error mt-1">{erreurs.meta_description[0]}</p>}

        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3.5" aria-label="Aperçu dans les résultats Google">
          <p className="tely-overline mb-2">Aperçu Google</p>
          <p className="truncate text-[11px] text-gray-600">
            {origine} › p › {doc.slug || "adresse"}
          </p>
          <p className="mt-0.5 truncate text-[15px] leading-snug text-[#1a0dab]">{doc.titre || "Titre de la page"} | Tely</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600">
            {doc.meta_description
              ? nbMeta > META_CONSEILLEE
                ? `${[...doc.meta_description].slice(0, META_CONSEILLEE).join("")}…`
                : doc.meta_description
              : "Ajoutez une description pour maîtriser le texte affiché dans les moteurs de recherche."}
          </p>
        </div>
      </div>

      {/* Image OG */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-gray-700">Image de partage (réseaux sociaux)</p>
        {doc.image_og && !ogInvalide ? (
          <div className="group relative overflow-hidden rounded-xl border border-gray-200">
            <img src={resolveImageUrl(doc.image_og) ?? ""} alt="Image de partage" className="aspect-[1200/630] w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-1">
              <button type="button" onClick={() => setPicker(true)} className="cursor-pointer rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow">
                Changer
              </button>
              <button type="button" onClick={() => onChanger({ image_og: "" })} className="cursor-pointer rounded-lg bg-white/95 p-1 text-gray-900 shadow" aria-label="Retirer l'image de partage">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="flex aspect-[1200/630] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
          >
            <ImagePlus size={20} /> Choisir une image (1200 × 630 conseillé)
          </button>
        )}
        {(ogInvalide || erreurs.image_og) && <p className="tely-error mt-1">{erreurs.image_og?.[0] ?? "Adresse d'image non autorisée."}</p>}
        <MediaPicker ouvert={picker} onFermer={() => setPicker(false)} valeurActuelle={doc.image_og} onChoisir={(url) => onChanger({ image_og: url })} />
      </div>

      {/* Emplacements */}
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-xs font-semibold text-gray-700">Emplacements</legend>
        {(
          [
            { cle: "est_accueil", libelle: "Page d'accueil", aide: "Remplace le contenu de la page d'accueil du site (une seule à la fois).", icone: House },
            { cle: "dans_menu", libelle: "Afficher dans le menu", aide: "Lien dans l'en-tête du site.", icone: PanelTop },
            { cle: "dans_footer", libelle: "Afficher dans le pied de page", aide: "Lien dans le bas de toutes les pages.", icone: PanelBottom },
          ] as const
        ).map((o) => (
          <label key={o.cle} className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-gray-300 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50">
            <input
              type="checkbox"
              checked={doc[o.cle]}
              onChange={(e) => onChanger({ [o.cle]: e.target.checked } as Partial<DocEditeur>)}
              className="tely-checkbox mt-0.5"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                <o.icone size={13} /> {o.libelle}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{o.aide}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
