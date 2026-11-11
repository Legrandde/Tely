import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  GraduationCap,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/ToastContext";
import { fetchParametres, saveParametres } from "../services/parametreService";
import type { PlatformSettings } from "../types/parametre";

export default function ParametresPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === "administrateur";

  const [activeTab, setActiveTab] = useState<"general" | "pedagogie" | "notifications" | "securite">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PlatformSettings>({
    site_nom: "Tely Elearning",
    site_description: "Plateforme d'exercices, de sujets d'examen et de ressources éducatives.",
    contact_email: "contact@tely.com",
    mode_maintenance: "0",
    inscriptions_ouvertes: "1",
    candidatures_ouvertes: "1",
    correction_obligatoire: "0",
    taille_max_fichier_mo: "25",
    notif_email_candidature: "1",
    notif_email_exercice: "0",
    alertes_navigateur: "1",
    longueur_min_mdp: "8",
    expiration_session_min: "120",
  });

  useEffect(() => {
    fetchParametres()
      .then((data) => {
        setForm((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        // Fallback silently
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (key: keyof PlatformSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof PlatformSettings) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key] === "1" ? "0" : "1",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isAdmin) {
        await saveParametres(form);
      }
      addToast("success", "Paramètres et préférences enregistrés avec succès !");
    } catch {
      addToast("error", "Erreur lors de l'enregistrement des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isAdmin ? "Paramètres de la Plateforme" : "Paramètres & Préférences"}
            </h1>
            <p className="text-xs text-gray-500">
              {isAdmin
                ? "Configurez le fonctionnement global du site, les accès pédagogiques et les notifications."
                : "Gérez vos options de réception des alertes et préférences de compte."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Enregistrement...
            </>
          ) : (
            <>
              <Save size={15} /> Enregistrer les réglages
            </>
          )}
        </button>
      </div>

      {/* ── Onglets de Navigation ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-xl border border-gray-100 shadow-sm no-scrollbar text-xs">
        {[
          { key: "general", label: "Général", icon: <Globe size={15} /> },
          ...(isAdmin
            ? [
                { key: "pedagogie", label: "Pédagogie & Inscriptions", icon: <GraduationCap size={15} /> },
              ]
            : []),
          { key: "notifications", label: "Notifications & Alertes", icon: <Bell size={15} /> },
          { key: "securite", label: "Sécurité & Sessions", icon: <Shield size={15} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-amber-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Formulaire des Paramètres ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Onglet Général */}
        {activeTab === "general" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Globe size={16} className="text-amber-500" />
              Informations générales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nom du service / de l'application
                </label>
                <input
                  type="text"
                  value={form.site_nom}
                  onChange={(e) => handleChange("site_nom", e.target.value)}
                  disabled={!isAdmin}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Adresse e-mail de contact & support
                </label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  disabled={!isAdmin}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description de la plateforme (Meta / SEO)
              </label>
              <textarea
                rows={3}
                value={form.site_description}
                onChange={(e) => handleChange("site_description", e.target.value)}
                disabled={!isAdmin}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {isAdmin && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-amber-600" /> Mode Maintenance
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Rend l'application temporairement inaccessible aux apprenants pour les opérations de mise à jour.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("mode_maintenance")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.mode_maintenance === "1" ? "bg-amber-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        form.mode_maintenance === "1" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Pédagogie (Admin) */}
        {activeTab === "pedagogie" && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-amber-500" />
              Règles d'inscription et de production pédagogique
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div>
                  <p className="text-xs font-bold text-gray-900">Inscriptions des élèves ouvertes</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Permet aux apprenants de créer librement un compte pour accéder aux exercices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("inscriptions_ouvertes")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.inscriptions_ouvertes === "1" ? "bg-amber-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.inscriptions_ouvertes === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div>
                  <p className="text-xs font-bold text-gray-900">Formulaire de recrutement enseignant actif</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Affiche la section de candidature sur la page d'accueil pour attirer de nouveaux professeurs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("candidatures_ouvertes")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.candidatures_ouvertes === "1" ? "bg-amber-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.candidatures_ouvertes === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div>
                  <p className="text-xs font-bold text-gray-900">Exiger un corrigé pour chaque exercice publié</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Empêche la validation d'un exercice si une solution détaillée n'est pas fournie.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("correction_obligatoire")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.correction_obligatoire === "1" ? "bg-amber-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.correction_obligatoire === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Taille maximale autorisée pour les documents PDF (en Mo)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={form.taille_max_fichier_mo}
                  onChange={(e) => handleChange("taille_max_fichier_mo", e.target.value)}
                  className="w-48 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Bell size={16} className="text-amber-500" />
              Canaux d'alertes & notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div>
                  <p className="text-xs font-bold text-gray-900">Notifications d'activités dans l'application</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Afficher les alertes dans la cloche du haut d'écran en temps réel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("alertes_navigateur")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.alertes_navigateur === "1" ? "bg-amber-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.alertes_navigateur === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Email d'alerte lors d'une candidature professeur</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Envoyer automatiquement un récapitulatif à l'administrateur dès qu'un enseignant postule.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("notif_email_candidature")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.notif_email_candidature === "1" ? "bg-amber-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        form.notif_email_candidature === "1" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div>
                  <p className="text-xs font-bold text-gray-900">Email récapitulatif des nouveaux exercices</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Recevoir une synthèse hebdomadaire des épreuves et corrections ajoutées.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("notif_email_exercice")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.notif_email_exercice === "1" ? "bg-amber-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.notif_email_exercice === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Sécurité */}
        {activeTab === "securite" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Shield size={16} className="text-amber-500" />
              Sécurité des comptes & Sessions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Longueur minimale des mots de passe
                </label>
                <select
                  value={form.longueur_min_mdp}
                  onChange={(e) => handleChange("longueur_min_mdp", e.target.value)}
                  disabled={!isAdmin}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="6">6 caractères</option>
                  <option value="8">8 caractères (recommandé)</option>
                  <option value="10">10 caractères</option>
                  <option value="12">12 caractères (haute sécurité)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Expiration de session pour inactivité
                </label>
                <select
                  value={form.expiration_session_min}
                  onChange={(e) => handleChange("expiration_session_min", e.target.value)}
                  disabled={!isAdmin}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="60">1 heure</option>
                  <option value="120">2 heures</option>
                  <option value="480">8 heures</option>
                  <option value="1440">24 heures</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Authentification Google One Tap active</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Les utilisateurs peuvent se connecter en un clic avec leur compte Google de manière chiffrée.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de sauvegarde inférieur */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Save size={15} /> Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
