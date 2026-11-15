import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/ToastContext";
import { useFavoris } from "../../hooks/useFavoris";
import { messageErreur } from "../../services/eleveService";
import InvitationInscriptionModal from "./InvitationInscriptionModal";

interface FavoriButtonProps {
  exerciceId: number;
  titre?: string;
  /** "icone" : pastille ronde (cartes) ; "bouton" : bouton avec libellé (page détail) */
  variante?: "icone" | "bouton";
  className?: string;
  /** Appelé après confirmation serveur (ex. retirer la carte de « Mes favoris ») */
  onChange?: (favori: boolean) => void;
}

/**
 * Cœur « favori » : bascule optimiste pour un élève, invitation à s'inscrire pour un visiteur,
 * masqué pour les professeurs / administrateurs.
 */
export default function FavoriButton({
  exerciceId,
  titre,
  variante = "icone",
  className = "",
  onChange,
}: FavoriButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { estEleve, estFavori, basculer } = useFavoris();
  const { addToast } = useToast();
  const [invitationOuverte, setInvitationOuverte] = useState(false);
  const [enCours, setEnCours] = useState(false);

  if (isLoading || (isAuthenticated && !estEleve)) return null;

  const actif = estEleve && estFavori(exerciceId);
  const libelle = actif ? "Retirer des favoris" : "Ajouter aux favoris";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setInvitationOuverte(true);
      return;
    }
    if (enCours) return;
    setEnCours(true);
    try {
      const res = await basculer(exerciceId);
      addToast(
        "success",
        res.favori
          ? `${titre ? `« ${titre} »` : "Exercice"} ajouté à vos favoris.`
          : "Retiré de vos favoris."
      );
      onChange?.(res.favori);
    } catch (err) {
      addToast("error", messageErreur(err, "Impossible de mettre à jour vos favoris."));
    } finally {
      setEnCours(false);
    }
  }

  const coeur = (
    <Heart
      size={variante === "icone" ? 16 : 17}
      aria-hidden="true"
      className={`transition-all duration-200 ${
        actif ? "fill-amber-500 text-amber-500 scale-110" : "text-gray-700"
      }`}
    />
  );

  return (
    <>
      {variante === "icone" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={actif}
          aria-label={libelle}
          title={libelle}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${className}`}
        >
          {coeur}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={actif}
          className={`tely-btn-outline w-full ${actif ? "border-amber-200 bg-amber-50 hover:bg-amber-50" : ""} ${className}`}
        >
          {coeur}
          {actif ? "Dans vos favoris" : "Ajouter aux favoris"}
        </button>
      )}

      <InvitationInscriptionModal
        open={invitationOuverte}
        onClose={() => setInvitationOuverte(false)}
      />
    </>
  );
}
