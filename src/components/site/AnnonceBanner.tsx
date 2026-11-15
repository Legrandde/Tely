import { useState } from "react";
import { ArrowRight, Info, Megaphone, TriangleAlert, X } from "lucide-react";
import { useSite } from "../../context/SiteContext";
import SmartLink from "./SmartLink";

const STORAGE_KEY = "tely:annonce-fermee";

const STYLES = {
  info: { conteneur: "bg-gray-900 text-white", bouton: "hover:bg-white/10", lien: "text-amber-300", Icone: Info },
  promo: { conteneur: "bg-amber-500 text-gray-900", bouton: "hover:bg-black/10", lien: "text-gray-900", Icone: Megaphone },
  alerte: { conteneur: "bg-red-600 text-white", bouton: "hover:bg-white/10", lien: "text-white", Icone: TriangleAlert },
} as const;

function empreinte(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h << 5) + h + texte.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

function lireFermee(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Bandeau d'annonce du site public (paramètres `annonce_*`), fermable et mémorisé par texte. */
export default function AnnonceBanner() {
  const { parametres } = useSite();
  const [fermee, setFermee] = useState<string | null>(lireFermee);

  const texte = parametres?.annonce_texte?.trim() ?? "";
  if (parametres?.annonce_active !== "1" || !texte) return null;

  const cle = empreinte(texte);
  if (fermee === cle) return null;

  const style = STYLES[(parametres.annonce_style as keyof typeof STYLES) ?? "info"] ?? STYLES.info;
  const { Icone } = style;
  const lienTexte = parametres.annonce_lien_texte?.trim() || "En savoir plus";

  function fermer() {
    try {
      localStorage.setItem(STORAGE_KEY, cle);
    } catch {
      // ignore
    }
    setFermee(cle);
  }

  return (
    <div role="region" aria-label="Annonce" className={`relative w-full ${style.conteneur}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 text-center text-xs font-medium sm:text-sm">
        <Icone size={16} className="hidden shrink-0 sm:block" aria-hidden="true" />
        <p className="min-w-0">
          <span>{texte}</span>
          <SmartLink
            href={parametres.annonce_lien}
            className={`ml-2 inline-flex items-center gap-1 font-bold underline underline-offset-2 ${style.lien}`}
          >
            {lienTexte}
            <ArrowRight size={14} aria-hidden="true" />
          </SmartLink>
        </p>
      </div>
      <button
        type="button"
        onClick={fermer}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors ${style.bouton}`}
        aria-label="Fermer l'annonce"
      >
        <X size={16} />
      </button>
    </div>
  );
}
