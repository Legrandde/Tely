import { useEffect } from "react";
import { useSite } from "../context/SiteContext";
import { resolveImageUrl } from "../utils/imageUrl";

export interface SeoOptions {
  /** Titre de la page (le nom du site est ajouté : « Titre — Tely »). */
  title: string;
  description?: string | null;
  /** Image de partage (chemin public `/x.png`, chemin backend ou URL absolue). */
  image?: string | null;
  noindex?: boolean;
  /** og:type (défaut « website »). */
  type?: string;
}

const DESCRIPTION_PAR_DEFAUT =
  "Exercices corrigés, anciens sujets d'examen et corrections détaillées pour réviser du collège au lycée. Inscription gratuite.";
const IMAGE_PAR_DEFAUT = "/banner3.png";

function urlAbsolue(chemin: string | null | undefined): string {
  const origine = window.location.origin;
  if (!chemin) return `${origine}${IMAGE_PAR_DEFAUT}`;
  if (/^https?:\/\//i.test(chemin)) return chemin;
  if (chemin.startsWith("/") && !chemin.startsWith("/storage")) return `${origine}${chemin}`;
  const resolue = resolveImageUrl(chemin);
  if (!resolue) return `${origine}${IMAGE_PAR_DEFAUT}`;
  return /^https?:\/\//i.test(resolue) ? resolue : `${origine}${resolue}`;
}

type Restauration = () => void;

/** Crée ou met à jour une balise <meta>/<link> et renvoie une fonction de restauration. */
function poserBalise(
  tag: "meta" | "link",
  attrCle: "name" | "property" | "rel",
  cle: string,
  attrValeur: "content" | "href",
  valeur: string | null
): Restauration {
  const selecteur = `${tag}[${attrCle}="${cle}"]`;
  let el = document.head.querySelector<HTMLElement>(selecteur);
  const existait = !!el;
  const ancienne = el?.getAttribute(attrValeur) ?? null;

  if (valeur === null) {
    // On retire la balise pendant la vie de la page, on la remet ensuite.
    if (el) el.remove();
    return () => {
      if (existait && el) document.head.appendChild(el);
    };
  }

  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attrCle, cle);
    document.head.appendChild(el);
  }
  el.setAttribute(attrValeur, valeur);
  const cible = el;

  return () => {
    if (!existait) {
      cible.remove();
    } else if (ancienne !== null) {
      cible.setAttribute(attrValeur, ancienne);
    }
  };
}

/**
 * Met à jour titre, description, Open Graph, Twitter, canonical et robots
 * pour la page courante, puis restaure l'état précédent au démontage.
 */
export function useSeo({ title, description, image, noindex = false, type = "website" }: SeoOptions) {
  const { parametres } = useSite();
  const siteNom = parametres?.site_nom?.trim() || "Tely";
  const descriptionSite = parametres?.site_description?.trim();

  useEffect(() => {
    const titre = title && title.trim() && title.trim() !== siteNom ? `${title.trim()} — ${siteNom}` : siteNom;
    const desc = (description?.trim() || descriptionSite || DESCRIPTION_PAR_DEFAUT).slice(0, 300);
    const url = `${window.location.origin}${window.location.pathname}`;
    const img = urlAbsolue(image);

    const ancienTitre = document.title;
    document.title = titre;

    const restaurations: Restauration[] = [
      poserBalise("meta", "name", "description", "content", desc),
      poserBalise("meta", "property", "og:title", "content", titre),
      poserBalise("meta", "property", "og:description", "content", desc),
      poserBalise("meta", "property", "og:image", "content", img),
      poserBalise("meta", "property", "og:url", "content", url),
      poserBalise("meta", "property", "og:type", "content", type),
      poserBalise("meta", "property", "og:site_name", "content", siteNom),
      poserBalise("meta", "name", "twitter:card", "content", "summary_large_image"),
      poserBalise("meta", "name", "twitter:title", "content", titre),
      poserBalise("meta", "name", "twitter:description", "content", desc),
      poserBalise("meta", "name", "twitter:image", "content", img),
      poserBalise("link", "rel", "canonical", "href", noindex ? null : url),
      poserBalise("meta", "name", "robots", "content", noindex ? "noindex, nofollow" : null),
    ];

    return () => {
      document.title = ancienTitre;
      for (let i = restaurations.length - 1; i >= 0; i--) restaurations[i]();
    };
  }, [title, description, image, noindex, type, siteNom, descriptionSite]);
}

/**
 * Injecte des données structurées JSON-LD (script `application/ld+json`
 * créé en JS, contenu posé via `textContent` — aucun HTML injecté).
 */
export function useJsonLd(id: string, donnees: unknown) {
  const json = donnees ? JSON.stringify(donnees) : "";

  useEffect(() => {
    if (!json) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${id}`;
    script.textContent = json.replace(/</g, "\\u003c");
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [id, json]);
}

export default useSeo;
