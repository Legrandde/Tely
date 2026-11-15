import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ShieldCheck, AlertTriangle, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/ToastContext";
import { exporterMesDonnees, supprimerMonCompte } from "../../services/authService";
import { reinitialiserFavoris } from "../../hooks/useFavoris";

const MOT_CLE = "SUPPRIMER";

interface ErreursSuppression {
  confirmation?: string;
  password?: string;
  global?: string;
}

/**
 * Droits RGPD de l'utilisateur (tous rôles) : export des données et suppression du compte.
 */
export default function CompteDonneesSection() {
  const { user, logoutLocal } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [exportEnCours, setExportEnCours] = useState(false);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurs, setErreurs] = useState<ErreursSuppression>({});

  useEffect(() => {
    if (!modaleOuverte) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !suppressionEnCours) {
        setModaleOuverte(false);
        setConfirmation("");
        setMotDePasse("");
        setErreurs({});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modaleOuverte, suppressionEnCours]);

  function fermer() {
    setModaleOuverte(false);
    setConfirmation("");
    setMotDePasse("");
    setErreurs({});
  }

  async function telecharger() {
    setExportEnCours(true);
    try {
      await exporterMesDonnees();
      addToast("success", "Vos données ont été téléchargées.");
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      addToast(
        "error",
        status === 429
          ? "Trop de demandes d'export. Réessayez dans une minute."
          : "Impossible d'exporter vos données pour le moment."
      );
    } finally {
      setExportEnCours(false);
    }
  }

  async function supprimer(e: React.FormEvent) {
    e.preventDefault();
    if (confirmation.trim() !== MOT_CLE) {
      setErreurs({ confirmation: `Tapez ${MOT_CLE} en majuscules pour confirmer.` });
      return;
    }
    setSuppressionEnCours(true);
    setErreurs({});
    try {
      await supprimerMonCompte({
        confirmation: MOT_CLE,
        ...(motDePasse ? { password: motDePasse } : {}),
      });
      reinitialiserFavoris();
      logoutLocal();
      addToast("success", "Votre compte a été supprimé. Merci d'avoir utilisé Tely.");
      navigate("/", { replace: true });
    } catch (err) {
      const reponse = (err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
      })?.response;
      if (reponse?.status === 422) {
        setErreurs({
          confirmation: reponse.data?.errors?.confirmation?.[0],
          password: reponse.data?.errors?.password?.[0],
          global: reponse.data?.errors ? undefined : reponse.data?.message,
        });
      } else {
        setErreurs({
          global: reponse?.data?.message ?? "La suppression a échoué. Réessayez plus tard.",
        });
      }
    } finally {
      setSuppressionEnCours(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes données */}
        <section className="tely-card p-6 space-y-4" aria-labelledby="titre-mes-donnees">
          <div className="border-b border-gray-200 pb-4">
            <h2 id="titre-mes-donnees" className="tely-title text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-gray-900" aria-hidden="true" /> Mes données
            </h2>
            <p className="tely-subtitle mt-0.5">Vos informations vous appartiennent</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Téléchargez une copie de vos données personnelles (compte, profil
            {user?.role === "eleve" ? ", historique de révision" : ""}) au format JSON.
          </p>
          <button type="button" onClick={telecharger} disabled={exportEnCours} className="tely-btn-outline">
            <Download size={16} aria-hidden="true" />
            {exportEnCours ? "Préparation..." : "Télécharger mes données"}
          </button>
        </section>

        {/* Zone de danger */}
        <section className="tely-card p-6 space-y-4 ring-1 ring-red-100" aria-labelledby="titre-zone-danger">
          <div className="border-b border-red-100 pb-4">
            <h2 id="titre-zone-danger" className="tely-title text-lg flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} className="text-red-500" aria-hidden="true" /> Zone de danger
            </h2>
            <p className="tely-subtitle mt-0.5">Action définitive et irréversible</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            La suppression efface vos informations personnelles et ferme définitivement votre accès
            {user?.role === "eleve" ? " (favoris, historique et progression compris)" : ""}.
          </p>
          <button type="button" onClick={() => setModaleOuverte(true)} className="tely-btn-danger">
            <Trash2 size={16} aria-hidden="true" /> Supprimer mon compte
          </button>
        </section>
      </div>

      {modaleOuverte && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !suppressionEnCours && fermer()}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-suppression"
            onClick={(e) => e.stopPropagation()}
            onSubmit={supprimer}
            className="tely-card tely-animate w-full max-w-md p-6 space-y-4"
            noValidate
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="titre-suppression" className="tely-title text-xl">
                  Supprimer définitivement votre compte ?
                </h3>
                <p className="tely-subtitle mt-1.5 leading-relaxed">
                  Cette action est irréversible. Pensez à télécharger vos données avant de continuer.
                </p>
              </div>
              <button
                type="button"
                onClick={fermer}
                disabled={suppressionEnCours}
                className="tely-icon-btn shrink-0"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {erreurs.global && (
              <p className="tely-error bg-red-50 rounded-[10px] px-3 py-2" role="alert">
                {erreurs.global}
              </p>
            )}

            <div>
              <label htmlFor="confirmation-suppression" className="tely-label block mb-1.5">
                Tapez <strong className="text-gray-900">{MOT_CLE}</strong> pour confirmer
              </label>
              <input
                id="confirmation-suppression"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={!!erreurs.confirmation}
                aria-describedby={erreurs.confirmation ? "erreur-confirmation" : undefined}
                className="tely-input"
                placeholder={MOT_CLE}
              />
              {erreurs.confirmation && (
                <p id="erreur-confirmation" className="tely-error mt-1">
                  {erreurs.confirmation}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="mdp-suppression" className="tely-label block mb-1.5">
                Mot de passe actuel
              </label>
              <input
                id="mdp-suppression"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                aria-invalid={!!erreurs.password}
                aria-describedby="aide-mdp-suppression"
                className="tely-input"
                placeholder="••••••••"
              />
              <p id="aide-mdp-suppression" className={erreurs.password ? "tely-error mt-1" : "text-[11px] text-gray-400 mt-1"}>
                {erreurs.password ?? "Inutile si vous vous connectez uniquement avec Google."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="button" onClick={fermer} disabled={suppressionEnCours} className="tely-btn-outline flex-1">
                Annuler
              </button>
              <button
                type="submit"
                disabled={suppressionEnCours || confirmation.trim() !== MOT_CLE}
                className="tely-btn-danger flex-1"
              >
                {suppressionEnCours ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
