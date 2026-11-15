import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useToast } from "../../../context/ToastContext";
import { liensPartage, type LienPartage } from "../utils";

const ICONES: Record<LienPartage["id"], IconType> = {
  whatsapp: FaWhatsapp,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
};

/** Boutons de partage : copie du lien, réseaux sociaux, partage natif si disponible. */
export default function PartageArticle({ url, titre }: { url: string; titre: string }) {
  const toast = useToast();
  const [copie, setCopie] = useState(false);
  const partageNatif = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (!copie) return;
    const t = window.setTimeout(() => setCopie(false), 2000);
    return () => window.clearTimeout(t);
  }, [copie]);

  async function copier() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      toast.success("Lien copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de copier le lien. Copiez-le depuis la barre d'adresse.");
    }
  }

  async function partager() {
    try {
      await navigator.share({ title: titre, url });
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  }

  const bouton =
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-900 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Partager l'article">
      {partageNatif && (
        <button type="button" onClick={() => void partager()} className={`${bouton} bg-gray-900 text-white hover:bg-gray-700 hover:text-white`}>
          <Share2 size={16} aria-hidden="true" /> Partager
        </button>
      )}
      <button type="button" onClick={() => void copier()} className={bouton} aria-live="polite">
        {copie ? <Check size={16} className="text-emerald-600" aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        {copie ? "Lien copié" : "Copier le lien"}
      </button>
      {liensPartage(url, titre).map((l) => {
        const Icone = ICONES[l.id];
        return (
          <a
            key={l.id}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Partager sur ${l.libelle} (nouvel onglet)`}
            title={`Partager sur ${l.libelle}`}
            className={`${bouton} w-10 px-0`}
          >
            <Icone size={15} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
