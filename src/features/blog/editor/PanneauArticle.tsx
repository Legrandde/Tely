import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, FilePen, ImagePlus, Send, Star, WandSparkles, X } from "lucide-react";
import MediaPicker from "../../pagebuilder/editor/MediaPicker";
import { lienSur, slugifier } from "../../pagebuilder/utils/liens";
import { resolveImageUrl } from "../../../utils/imageUrl";
import type { ArticleAdmin, CategorieBlog } from "../../../types/blog";
import { dateHeureLongue, isoVersLocal } from "../utils";
import { BadgeStatut } from "../components/Elements";
import SaisieTags from "./SaisieTags";
import {
  EXTRAIT_MAX,
  erreurSlugArticle,
  MAX_TAGS,
  META_CONSEILLEE,
  META_MAX,
  SLUG_MAX,
  TITRE_MAX,
  type DocArticle,
  type ModePublication,
} from "./etatArticle";

function Compteur({ n, max, alerte }: { n: number; max: number; alerte?: number }) {
  const couleur = n > max ? "text-red-600" : alerte && n > alerte ? "text-amber-600" : "text-gray-400";
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${couleur}`} aria-live="polite">
      {n} / {max}
    </span>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-gray-100 px-4 py-5 last:border-b-0">
      <h3 className="tely-overline">{titre}</h3>
      {children}
    </section>
  );
}

/** Valeur minimale du sélecteur de date (maintenant, heure locale). */
function maintenantLocal() {
  return isoVersLocal(new Date().toISOString());
}

export default function PanneauArticle({
  doc,
  erreurs,
  onChanger,
  categories,
  suggestionsTags,
  serveur,
}: {
  doc: DocArticle;
  erreurs: Record<string, string[]>;
  onChanger: (modif: Partial<DocArticle>, fusion?: string) => void;
  categories: CategorieBlog[];
  suggestionsTags: string[];
  serveur: ArticleAdmin;
}) {
  const id = useId();
  const [picker, setPicker] = useState(false);
  const errSlug = erreurs.slug?.[0] ?? erreurSlugArticle(doc.slug);
  const nbTitre = [...doc.titre].length;
  const nbExtrait = [...doc.extrait].length;
  const nbMeta = [...doc.meta_description].length;
  const couvertureInvalide = !!doc.image_couverture && !lienSur(doc.image_couverture);
  const origine = typeof window !== "undefined" ? window.location.host : "tely.com";
  const descriptionGoogle = doc.meta_description || doc.extrait;

  const modes: { id: ModePublication; libelle: string; aide: string; icone: typeof Send }[] = [
    { id: "brouillon", libelle: "Brouillon", aide: "Invisible sur le blog.", icone: FilePen },
    { id: "maintenant", libelle: "Publier maintenant", aide: "Visible dès l'enregistrement.", icone: Send },
    { id: "programme", libelle: "Programmer", aide: "Publication automatique à la date choisie.", icone: CalendarClock },
  ];

  return (
    <div>
      {/* ── Publication ─────────────────────────────────────────────── */}
      <Section titre="Publication">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          Actuellement : <BadgeStatut article={serveur} />
          {serveur.statut === "publie" && !serveur.est_programme && serveur.publie_le && <span>depuis le {dateHeureLongue(serveur.publie_le)}</span>}
        </div>
        <fieldset>
          <legend className="sr-only">Mode de publication</legend>
          <div className="space-y-2">
            {modes.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-gray-300 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500"
              >
                <input
                  type="radio"
                  name={`${id}-publication`}
                  value={m.id}
                  checked={doc.publication === m.id}
                  onChange={() =>
                    onChanger(
                      m.id === "programme" && !doc.date_programmee
                        ? { publication: m.id, date_programmee: isoVersLocal(new Date(Date.now() + 86_400_000).toISOString()).slice(0, 11) + "08:00" }
                        : { publication: m.id }
                    )
                  }
                  className="mt-0.5 accent-gray-900"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                    <m.icone size={13} aria-hidden="true" /> {m.libelle}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{m.aide}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {doc.publication === "programme" && (
          <div>
            <label htmlFor={`${id}-date`} className="mb-1.5 block text-xs font-semibold text-gray-700">
              Date et heure de publication
            </label>
            <input
              id={`${id}-date`}
              type="datetime-local"
              value={doc.date_programmee}
              min={maintenantLocal()}
              onChange={(e) => onChanger({ date_programmee: e.target.value }, "date")}
              aria-invalid={!!erreurs.publie_le}
              aria-describedby={`${id}-date-aide`}
              className={`tely-input py-2.5 ${erreurs.publie_le ? "border-red-300" : ""}`}
            />
            <p id={`${id}-date-aide`} className="mt-1 text-[11px] text-gray-400">
              Heure locale de votre appareil. L'article apparaîtra automatiquement sur le blog à cette date.
            </p>
          </div>
        )}
        {(erreurs.publie_le || erreurs.statut) && <p className="tely-error">{(erreurs.publie_le ?? erreurs.statut)?.[0]}</p>}
        {doc.publication !== "brouillon" && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-gray-700">
            Le choix est appliqué au prochain enregistrement (bouton « Enregistrer » ou Ctrl+S).
          </p>
        )}
      </Section>

      {/* ── Contenu ─────────────────────────────────────────────────── */}
      <Section titre="Article">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${id}-titre`} className="text-xs font-semibold text-gray-700">
              Titre
            </label>
            <Compteur n={nbTitre} max={TITRE_MAX} alerte={70} />
          </div>
          <input
            id={`${id}-titre`}
            type="text"
            maxLength={TITRE_MAX}
            value={doc.titre}
            onChange={(e) => onChanger({ titre: e.target.value }, "titre")}
            aria-invalid={!!erreurs.titre}
            className={`tely-input py-2.5 ${erreurs.titre ? "border-red-300" : ""}`}
          />
          {erreurs.titre && <p className="tely-error mt-1">{erreurs.titre[0]}</p>}
        </div>

        <div>
          <label htmlFor={`${id}-slug`} className="mb-1.5 block text-xs font-semibold text-gray-700">
            Adresse (slug)
          </label>
          <div
            className={`flex items-center overflow-hidden rounded-[10px] border bg-gray-50 transition-all focus-within:border-gray-900 focus-within:bg-white ${
              errSlug ? "border-red-300" : "border-gray-200"
            }`}
          >
            <span className="shrink-0 pl-3 text-sm text-gray-400">/blog/</span>
            <input
              id={`${id}-slug`}
              type="text"
              maxLength={SLUG_MAX}
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
              onClick={() => onChanger({ slug: slugifier(doc.titre).slice(0, SLUG_MAX) })}
              className="tely-icon-btn mr-1 p-1.5"
            >
              <WandSparkles size={14} />
            </button>
          </div>
          {errSlug && <p className="tely-error mt-1">{errSlug}</p>}
          {serveur.statut === "publie" && doc.slug !== serveur.slug && !errSlug && (
            <p className="mt-1 text-[11px] text-amber-700">Attention : modifier l'adresse d'un article publié casse les liens déjà partagés.</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${id}-extrait`} className="text-xs font-semibold text-gray-700">
              Extrait
            </label>
            <Compteur n={nbExtrait} max={EXTRAIT_MAX} alerte={300} />
          </div>
          <textarea
            id={`${id}-extrait`}
            rows={4}
            maxLength={EXTRAIT_MAX}
            value={doc.extrait}
            onChange={(e) => onChanger({ extrait: e.target.value }, "extrait")}
            aria-invalid={!!erreurs.extrait}
            aria-describedby={`${id}-extrait-aide`}
            className="tely-input resize-none py-2.5"
          />
          <p id={`${id}-extrait-aide`} className="mt-1 text-[11px] text-gray-400">
            Résumé affiché sur les cartes du blog et sous le titre de l'article.
          </p>
          {erreurs.extrait && <p className="tely-error mt-1">{erreurs.extrait[0]}</p>}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-700">Image de couverture</p>
          {doc.image_couverture && !couvertureInvalide ? (
            <div className="relative overflow-hidden rounded-xl border border-gray-200">
              <img src={resolveImageUrl(doc.image_couverture) ?? ""} alt="Image de couverture" className="aspect-[16/9] w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-1">
                <button type="button" onClick={() => setPicker(true)} className="cursor-pointer rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold text-gray-900 shadow">
                  Changer
                </button>
                <button
                  type="button"
                  onClick={() => onChanger({ image_couverture: "" })}
                  className="cursor-pointer rounded-lg bg-white/95 p-1 text-gray-900 shadow"
                  aria-label="Retirer l'image de couverture"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicker(true)}
              className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
              <ImagePlus size={20} /> Choisir une image (1600 × 900 conseillé)
            </button>
          )}
          {(couvertureInvalide || erreurs.image_couverture) && <p className="tely-error mt-1">{erreurs.image_couverture?.[0] ?? "Adresse d'image non autorisée."}</p>}
          <p className="mt-1 text-[11px] text-gray-400">Également utilisée comme image de partage sur les réseaux sociaux.</p>
          <MediaPicker ouvert={picker} onFermer={() => setPicker(false)} valeurActuelle={doc.image_couverture} onChoisir={(url) => onChanger({ image_couverture: url })} />
        </div>
      </Section>

      {/* ── Classement ──────────────────────────────────────────────── */}
      <Section titre="Classement">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${id}-categorie`} className="text-xs font-semibold text-gray-700">
              Catégorie
            </label>
            <Link to="/Dashbord-admin/blog?onglet=categories" target="_blank" className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:underline">
              Gérer les catégories
            </Link>
          </div>
          <select
            id={`${id}-categorie`}
            value={doc.categorie_blog_id ?? ""}
            onChange={(e) => onChanger({ categorie_blog_id: e.target.value ? Number(e.target.value) : null })}
            aria-invalid={!!erreurs.categorie_blog_id}
            className="tely-input py-2.5"
          >
            <option value="">Sans catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          {erreurs.categorie_blog_id && <p className="tely-error mt-1">{erreurs.categorie_blog_id[0]}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${id}-tags`} className="text-xs font-semibold text-gray-700">
              Mots-clés
            </label>
            <Compteur n={doc.tags.length} max={MAX_TAGS} />
          </div>
          <SaisieTags
            id={`${id}-tags`}
            tags={doc.tags}
            suggestions={suggestionsTags}
            onChanger={(tags) => onChanger({ tags })}
            invalide={!!erreurs.tags}
            describedBy={`${id}-tags-aide`}
          />
          <p id={`${id}-tags-aide`} className="mt-1 text-[11px] text-gray-400">
            Entrée ou virgule pour valider. {MAX_TAGS} mots-clés au maximum.
          </p>
          {erreurs.tags && <p className="tely-error mt-1">{erreurs.tags[0]}</p>}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-gray-300 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
          <input type="checkbox" checked={doc.mis_en_avant} onChange={(e) => onChanger({ mis_en_avant: e.target.checked })} className="tely-checkbox mt-0.5" />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
              <Star size={13} className={doc.mis_en_avant ? "fill-amber-400 text-amber-500" : ""} aria-hidden="true" /> Article à la une
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
              Affiché en grand format en tête du blog. Remplace l'article à la une actuel.
            </span>
          </span>
        </label>
      </Section>

      {/* ── Référencement ───────────────────────────────────────────── */}
      <Section titre="Référencement">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={`${id}-meta`} className="text-xs font-semibold text-gray-700">
              Meta description
            </label>
            <Compteur n={nbMeta} max={META_CONSEILLEE} alerte={140} />
          </div>
          <textarea
            id={`${id}-meta`}
            rows={3}
            maxLength={META_MAX}
            value={doc.meta_description}
            onChange={(e) => onChanger({ meta_description: e.target.value }, "meta")}
            aria-describedby={`${id}-meta-aide`}
            className="tely-input resize-none py-2.5"
          />
          <p id={`${id}-meta-aide`} className="mt-1 text-[11px] text-gray-400">
            {nbMeta > META_CONSEILLEE
              ? "Au-delà de 160 caractères, Google tronque la description."
              : "Idéalement entre 120 et 160 caractères. À défaut, l'extrait est utilisé."}
          </p>
          {erreurs.meta_description && <p className="tely-error mt-1">{erreurs.meta_description[0]}</p>}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5" role="group" aria-label="Aperçu dans les résultats Google">
          <p className="tely-overline mb-2">Aperçu Google</p>
          <p className="truncate text-[11px] text-gray-600">
            {origine} › blog › {doc.slug || "adresse"}
          </p>
          <p className="mt-0.5 truncate text-[15px] leading-snug text-[#1a0dab]">{doc.titre || "Titre de l'article"} | Tely</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600">
            {descriptionGoogle
              ? [...descriptionGoogle].length > META_CONSEILLEE
                ? `${[...descriptionGoogle].slice(0, META_CONSEILLEE).join("")}…`
                : descriptionGoogle
              : "Ajoutez une description pour maîtriser le texte affiché dans les moteurs de recherche."}
          </p>
        </div>
      </Section>
    </div>
  );
}
