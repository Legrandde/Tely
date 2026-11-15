import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, CheckCircle2, X } from "lucide-react";

interface InvitationInscriptionModalProps {
  open: boolean;
  onClose: () => void;
  titre?: string;
  texte?: string;
}

const AVANTAGES = [
  "Énoncés complets et corrigés détaillés",
  "Vos exercices favoris toujours sous la main",
  "Votre progression suivie jour après jour",
];

/**
 * Invitation à créer un compte, affichée quand un visiteur tente une action réservée
 * (ex. ajouter un favori). Les clics ne remontent pas au parent (cartes cliquables).
 */
export default function InvitationInscriptionModal({
  open,
  onClose,
  titre = "Gardez cet exercice sous la main",
  texte = "Créez votre compte gratuit pour enregistrer vos exercices favoris et les retrouver dans votre espace.",
}: InvitationInscriptionModalProps) {
  const location = useLocation();
  const from = location.pathname + location.search;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 cursor-default"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-inscription-titre"
        onClick={(e) => e.stopPropagation()}
        className="tely-card tely-animate w-full max-w-sm p-6 relative text-left"
      >
        <button
          type="button"
          onClick={onClose}
          className="tely-icon-btn absolute top-3 right-3"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <Heart size={22} className="fill-amber-500" aria-hidden="true" />
        </div>
        <h2 id="invitation-inscription-titre" className="tely-title text-xl pr-6">
          {titre}
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{texte}</p>

        <ul className="mt-4 space-y-2">
          {AVANTAGES.map((a) => (
            <li key={a} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 mt-6">
          <Link to="/auth/signup" state={{ from }} className="tely-btn w-full" onClick={onClose}>
            Créer mon compte gratuit
          </Link>
          <Link to="/auth/login" state={{ from }} className="tely-btn-outline w-full" onClick={onClose}>
            J'ai déjà un compte
          </Link>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-3">
          Gratuit, sans engagement · 30 secondes
        </p>
      </div>
    </div>
  );
}
