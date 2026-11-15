import { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  Mail,
  Camera,
  Lock,
  Save,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Hash,
  Layers,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/ToastContext";
import { updateProfile, updatePassword } from "../services/authService";
import { resolveImageUrl } from "../utils/imageUrl";
import api from "../api/axio";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ui/ConfirmModal";
import CompteDonneesSection from "../components/eleve/CompteDonneesSection";

interface NiveauOption {
  id: number;
  libelle: string;
}

export default function ProfilePage({ embedded = false }: { embedded?: boolean }) {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [nom, setNom] = useState(user?.nom || "");
  const [prenom, setPrenom] = useState(user?.prenom || "");
  const [email, setEmail] = useState(user?.email || "");
  const [motDePasseEmail, setMotDePasseEmail] = useState("");
  const emailModifie = !!user && email.trim().toLowerCase() !== (user.email || "").toLowerCase();
  const [specialite, setSpecialite] = useState(user?.professeur?.specialite || "");
  const [classe, setClasse] = useState(user?.eleve?.classe || "");
  const [matricule, setMatricule] = useState(user?.eleve?.matricule || "");
  const [niveauId, setNiveauId] = useState<number | string>(user?.eleve?.niveau_id || "");

  // Avatar file & preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url || resolveImageUrl(user?.avatar) || null
  );

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // Niveaux options
  const [niveaux, setNiveaux] = useState<NiveauOption[]>([]);

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmRemoveAvatarOpen, setConfirmRemoveAvatarOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);
  const userRef = useRef(user);

  useEffect(() => {
    if (user && user !== userRef.current) {
      userRef.current = user;
      setNom(user.nom || "");
      setPrenom(user.prenom || "");
      setEmail(user.email || "");
      setSpecialite(user.professeur?.specialite || "");
      setClasse(user.eleve?.classe || "");
      setMatricule(user.eleve?.matricule || "");
      setNiveauId(user.eleve?.niveau_id || "");
      setAvatarPreview(user.avatar_url || resolveImageUrl(user.avatar) || null);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (user?.role === "eleve") {
      api
        .get("/api/niveaux")
        .then((res) => {
          if (!cancelled) {
            const list = Array.isArray(res.data) ? res.data : res.data.data || [];
            setNiveaux(list);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("error", "L'image ne doit pas dépasser 5 Mo.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setConfirmRemoveAvatarOpen(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) {
      addToast("warning", "Le nom et l'email sont obligatoires.");
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("prenom", prenom);
      formData.append("email", email);
      if (emailModifie) {
        formData.append("current_password", motDePasseEmail);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (!avatarPreview) {
        formData.append("avatar", "");
      }

      if (user?.role === "professeur") {
        formData.append("specialite", specialite);
      }

      if (user?.role === "eleve") {
        if (classe) formData.append("classe", classe);
        if (matricule) formData.append("matricule", matricule);
        if (niveauId) formData.append("niveau_id", String(niveauId));
      }

      const res = await updateProfile(formData);
      setUser(res.user);
      setMotDePasseEmail("");
      addToast("success", "Votre profil a été mis à jour avec succès !");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erreur lors de la mise à jour du profil.";
      addToast("error", errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast("warning", "Veuillez renseigner votre mot de passe actuel.");
      return;
    }
    if (newPassword.length < 8) {
      addToast("warning", "Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (newPassword !== passwordConfirmation) {
      addToast("warning", "La confirmation du mot de passe ne correspond pas.");
      return;
    }
    setConfirmPasswordOpen(true);
  };

  const confirmPasswordChange = async () => {
    setSavingPassword(true);
    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      addToast("success", "Mot de passe modifié avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setConfirmPasswordOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Erreur lors de la modification du mot de passe.";
      addToast("error", errorMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case "administrateur":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Administrateur
          </span>
        );
      case "professeur":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Enseignant / Professeur
          </span>
        );
      case "eleve":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Élève / Apprenant
          </span>
        );
      default:
        return (
          <span className="tely-chip uppercase tracking-wide">
            Utilisateur
          </span>
        );
    }
  };

  return (
    <div className={embedded ? "space-y-6" : "p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6"}>
      {/* Bouton retour */}
      {!embedded && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="text-gray-900" /> Retour
        </button>
      )}

      {/* Header Banner Profil */}
      <div className="tely-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container with upload button */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-lg overflow-hidden ring-4 ring-gray-100 bg-gray-50 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.nom || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-3xl font-extrabold uppercase">
                  {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* Change button overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="tely-btn absolute bottom-1 right-1 p-2"
              title="Changer la photo de profil"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Meta */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h1 className="tely-h1">
                {user?.prenom} {user?.nom}
              </h1>
              <div>{getRoleBadge()}</div>
            </div>
            <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={15} className="text-gray-900" /> {user?.email}
            </p>

            {avatarPreview && (
              <button
                type="button"
                onClick={() => setConfirmRemoveAvatarOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium pt-1 cursor-pointer"
              >
                <Trash2 size={13} className="text-gray-900" /> Supprimer la photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire Informations Personnelles */}
        <div className="tely-card lg:col-span-2 p-6 space-y-5">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="tely-title text-lg flex items-center gap-2">
              <UserIcon size={18} className="text-gray-900" /> Informations Personnelles
            </h2>
            <p className="tely-subtitle mt-0.5">
              Modifiez votre identité et vos coordonnées pédagogiques
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="tely-label block mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  className="tely-input"
                />
              </div>

              <div>
                <label className="tely-label block mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom de famille"
                  required
                  className="tely-input"
                />
              </div>
            </div>

            <div>
              <label className="tely-label block mb-1.5">
                Adresse Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
                className="tely-input"
              />
            </div>

            {/* Changer d'adresse e-mail exige le mot de passe actuel (protection du compte) */}
            {emailModifie && (
              <div>
                <label htmlFor="mdp-confirmation-email" className="tely-label block mb-1.5">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <input
                  id="mdp-confirmation-email"
                  type="password"
                  autoComplete="current-password"
                  value={motDePasseEmail}
                  onChange={(e) => setMotDePasseEmail(e.target.value)}
                  required
                  aria-describedby="mdp-confirmation-email-aide"
                  className="tely-input"
                />
                <p id="mdp-confirmation-email-aide" className="tely-subtitle mt-1">
                  Par sécurité, confirmez votre mot de passe pour changer d'adresse e-mail.
                </p>
              </div>
            )}

            {/* Spécifique Professeur */}
            {user?.role === "professeur" && (
              <div className="pt-2 border-t border-gray-200 space-y-4">
                <h3 className="tely-overline flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-gray-900" /> Profil Enseignant
                </h3>
                <div>
                  <label className="tely-label block mb-1.5">
                    Discipline / Spécialité
                  </label>
                  <input
                    type="text"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                    placeholder="Ex: Mathématiques, Sciences Physiques..."
                    className="tely-input"
                  />
                </div>
              </div>
            )}

            {/* Spécifique Élève */}
            {user?.role === "eleve" && (
              <div className="pt-2 border-t border-gray-200 space-y-4">
                <h3 className="tely-overline flex items-center gap-1.5">
                  <BookOpen size={15} className="text-gray-900" /> Scolarité Apprenant
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="tely-label block flex items-center gap-1 mb-1.5">
                      <Hash size={13} className="text-gray-900" /> Matricule
                    </label>
                    <input
                      type="text"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      placeholder="Ex: MAT-2026"
                      className="tely-input"
                    />
                  </div>

                  <div>
                    <label className="tely-label block mb-1.5">Classe</label>
                    <input
                      type="text"
                      value={classe}
                      onChange={(e) => setClasse(e.target.value)}
                      placeholder="Ex: Tle S2"
                      className="tely-input"
                    />
                  </div>

                  <div>
                    <label className="tely-label block flex items-center gap-1 mb-1.5">
                      <Layers size={13} className="text-gray-900" /> Niveau
                    </label>
                    <select
                      value={niveauId}
                      onChange={(e) => setNiveauId(e.target.value)}
                      className="tely-input"
                    >
                      <option value="">Sélectionner</option>
                      {niveaux.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="tely-btn"
              >
                {savingProfile ? (
                  <span className="inline-block h-4 w-32 bg-white/30 rounded animate-pulse" />
                ) : (
                  <>
                    <Save size={16} /> Mettre à jour mon profil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Formulaire Sécurité & Mot de passe */}
        <div className="tely-card p-6 space-y-5">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="tely-title text-lg flex items-center gap-2">
              <Lock size={18} className="text-gray-900" /> Sécurité
            </h2>
            <p className="tely-subtitle mt-0.5">Modifier votre mot de passe</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="tely-label block mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="tely-input"
              />
            </div>

            <div>
              <label className="tely-label block mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                className="tely-input"
              />
            </div>

            <div>
              <label className="tely-label block mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                className="tely-input"
              />
            </div>

            <div className="pt-1 text-[11px] text-gray-500 space-y-1">
              <div className="font-semibold text-gray-700 flex items-center gap-1">
                <CheckCircle size={13} className="text-gray-900" /> Recommandations
              </div>
              <p>
                Utilisez au moins 8 caractères avec majuscules, chiffres et caractères spéciaux.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="tely-btn w-full"
              >
                {savingPassword ? (
                  <span className="inline-block h-4 w-32 bg-white/30 rounded animate-pulse" />
                ) : (
                  <>
                    <Lock size={15} /> Changer le mot de passe
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Droits RGPD : export & suppression du compte (tous les rôles) */}
      <CompteDonneesSection />

      <ConfirmModal
        open={confirmRemoveAvatarOpen}
        title="Supprimer la photo de profil"
        description="Êtes-vous sûr de vouloir retirer votre photo de profil ? N'oubliez pas d'enregistrer votre profil pour valider ce changement."
        confirmLabel="Retirer la photo"
        onConfirm={removeAvatar}
        onCancel={() => setConfirmRemoveAvatarOpen(false)}
      />

      <ConfirmModal
        open={confirmPasswordOpen}
        title="Confirmer le changement de mot de passe"
        description="Êtes-vous sûr de vouloir modifier votre mot de passe de connexion ?"
        confirmLabel="Confirmer"
        loadingLabel="Modification..."
        variant="warning"
        loading={savingPassword}
        onConfirm={confirmPasswordChange}
        onCancel={() => setConfirmPasswordOpen(false)}
      />
    </div>
  );
}
