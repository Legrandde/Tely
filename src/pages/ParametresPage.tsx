import { useState, useEffect, useMemo, useCallback, useId } from "react";
import {
  Settings,
  Globe,
  GraduationCap,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Share2,
  Wrench,
  RotateCcw,
  ArrowRight,
  Info,
  Sparkles,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/ToastContext";
import { fetchParametres, saveParametres } from "../services/parametreService";
import type { AnnonceStyle, PlatformSettings, ReseauSocialKey } from "../types/parametre";
import ConfirmModal from "../components/ui/ConfirmModal";

type TabKey = "general" | "site" | "pedagogie" | "notifications" | "securite";

const VALEURS_DEFAUT: PlatformSettings = {
  site_nom: "Tely Elearning",
  site_description: "Plateforme d'exercices, de sujets d'examen et de ressources éducatives.",
  contact_email: "contact@tely.com",
  contact_telephone: "",
  mode_maintenance: "0",
  message_maintenance: "",
  annonce_active: "0",
  annonce_texte: "",
  annonce_lien: "",
  annonce_lien_texte: "",
  annonce_style: "info",
  reseau_facebook: "",
  reseau_instagram: "",
  reseau_linkedin: "",
  reseau_youtube: "",
  reseau_tiktok: "",
  reseau_whatsapp: "",
  inscriptions_ouvertes: "1",
  candidatures_ouvertes: "1",
  correction_obligatoire: "0",
  taille_max_fichier_mo: "25",
  notif_email_candidature: "1",
  notif_email_exercice: "0",
  alertes_navigateur: "1",
  longueur_min_mdp: "8",
  expiration_session_min: "120",
};

const RESEAUX: Array<{ key: ReseauSocialKey; label: string; placeholder: string }> = [
  { key: "reseau_facebook", label: "Facebook", placeholder: "https://facebook.com/votre-page" },
  { key: "reseau_instagram", label: "Instagram", placeholder: "https://instagram.com/votre-compte" },
  { key: "reseau_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/votre-entreprise" },
  { key: "reseau_youtube", label: "YouTube", placeholder: "https://youtube.com/@votre-chaine" },
  { key: "reseau_tiktok", label: "TikTok", placeholder: "https://tiktok.com/@votre-compte" },
  { key: "reseau_whatsapp", label: "WhatsApp", placeholder: "https://wa.me/224600000000" },
];

const STYLES_ANNONCE: Array<{ val: AnnonceStyle; label: string; classes: string; icon: React.ReactNode }> = [
  { val: "info", label: "Information", classes: "bg-gray-900 text-white", icon: <Info size={15} /> },
  { val: "promo", label: "Promotion", classes: "bg-amber-500 text-gray-900", icon: <Sparkles size={15} /> },
  { val: "alerte", label: "Alerte", classes: "bg-red-500 text-white", icon: <AlertTriangle size={15} /> },
];

/** URL absolue http(s) valide. */
function estUrlHttp(valeur: string): boolean {
  try {
    const u = new URL(valeur);
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname;
  } catch {
    return false;
  }
}

/** Lien accepté par le serveur : http(s), relatif /…, #…, mailto:, tel:. */
function estLienSur(valeur: string): boolean {
  const v = valeur.trim();
  if (!v) return true;
  if (v.startsWith("/") && !v.startsWith("//")) return true;
  if (v.startsWith("#")) return true;
  if (/^mailto:[^\s]+$/i.test(v) || /^tel:[+\d\s().-]+$/i.test(v)) return true;
  return estUrlHttp(v);
}

function messageErreur(err: unknown, defaut: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  const premiere = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
  return premiere ?? data?.message ?? defaut;
}

/** Interrupteur accessible (role="switch"). */
function Interrupteur({
  actif,
  onToggle,
  label,
  disabled,
}: {
  actif: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        actif ? "bg-gray-900" : "bg-gray-200"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          actif ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function LigneInterrupteur({
  titre,
  description,
  actif,
  onToggle,
  icon,
  disabled,
}: {
  titre: string;
  description: string;
  actif: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-[10px] border border-gray-200">
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          {icon}
          {titre}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
      </div>
      <Interrupteur actif={actif} onToggle={onToggle} label={titre} disabled={disabled} />
    </div>
  );
}

function Champ({
  label,
  erreur,
  aide,
  children,
  id,
}: {
  label: string;
  erreur?: string;
  aide?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="tely-label block mb-1.5">
        {label}
      </label>
      {children}
      {erreur ? (
        <p id={`${id}-erreur`} className="tely-error mt-1" role="alert">
          {erreur}
        </p>
      ) : aide ? (
        <p id={`${id}-aide`} className="text-[11px] text-gray-400 mt-1">
          {aide}
        </p>
      ) : null}
    </div>
  );
}

export default function ParametresPage({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === "administrateur";
  const uid = useId();

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmMaintenanceOpen, setConfirmMaintenanceOpen] = useState(false);
  const [derniereSauvegarde, setDerniereSauvegarde] = useState<Date | null>(null);

  const [form, setForm] = useState<PlatformSettings>(VALEURS_DEFAUT);
  const [initial, setInitial] = useState<PlatformSettings>(VALEURS_DEFAUT);

  useEffect(() => {
    let annule = false;
    fetchParametres()
      .then((data) => {
        if (annule) return;
        const fusion = { ...VALEURS_DEFAUT, ...data };
        setForm(fusion);
        setInitial(fusion);
      })
      .catch(() => {
        if (!annule && isAdmin) addToast("error", "Impossible de charger les paramètres actuels.");
      })
      .finally(() => {
        if (!annule) setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [addToast, isAdmin]);

  /* ── Détection des changements non enregistrés ── */
  const clesModifiees = useMemo(
    () => Object.keys(form).filter((k) => (form[k] ?? "") !== (initial[k] ?? "")),
    [form, initial]
  );
  const modifie = isAdmin && !loading && clesModifiees.length > 0;

  useEffect(() => {
    if (!modifie) return;
    const avertir = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [modifie]);

  /* ── Validation client ── */
  const erreurs = useMemo(() => {
    const e: Partial<Record<string, string>> = {};
    for (const r of RESEAUX) {
      const v = (form[r.key] ?? "").trim();
      if (v && !estUrlHttp(v)) e[r.key] = "Adresse invalide : elle doit commencer par http:// ou https://";
    }
    if (!estLienSur(form.annonce_lien ?? "")) {
      e.annonce_lien = "Lien non autorisé : utilisez https://…, /chemin, #ancre, mailto: ou tel:.";
    }
    if (form.annonce_active === "1" && !(form.annonce_texte ?? "").trim()) {
      e.annonce_texte = "Le texte de la bannière est obligatoire quand elle est activée.";
    }
    if ((form.annonce_lien ?? "").trim() && !(form.annonce_lien_texte ?? "").trim()) {
      e.annonce_lien_texte = "Ajoutez un libellé pour le lien.";
    }
    const tel = (form.contact_telephone ?? "").trim();
    if (tel && !/^[+\d][\d\s().-]{5,24}$/.test(tel)) {
      e.contact_telephone = "Numéro invalide (chiffres, espaces et + uniquement).";
    }
    if ((form.contact_email ?? "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      e.contact_email = "Adresse e-mail invalide.";
    }
    return e;
  }, [form]);
  const nbErreurs = Object.keys(erreurs).length;

  const ongletDeCle = (cle: string): TabKey => {
    if (cle.startsWith("annonce_") || cle.startsWith("reseau_")) return "site";
    return "general";
  };

  const handleChange = (key: keyof PlatformSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof PlatformSettings) => {
    if (key === "mode_maintenance" && form.mode_maintenance !== "1") {
      setConfirmMaintenanceOpen(true);
      return;
    }
    setForm((prev) => ({
      ...prev,
      [key]: prev[key] === "1" ? "0" : "1",
    }));
  };

  const annulerModifications = useCallback(() => setForm(initial), [initial]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAdmin && nbErreurs > 0) {
      const premiere = Object.keys(erreurs)[0];
      setActiveTab(ongletDeCle(premiere));
      addToast("error", "Corrigez les champs signalés avant d'enregistrer.");
      return;
    }
    setSaving(true);
    try {
      if (isAdmin) {
        const payload: Partial<PlatformSettings> = {};
        for (const k of clesModifiees) payload[k] = (form[k] ?? "").trim();
        if (Object.keys(payload).length === 0) {
          addToast("info", "Aucune modification à enregistrer.");
          return;
        }
        const res = await saveParametres(payload);
        const fusion = { ...VALEURS_DEFAUT, ...res };
        setForm(fusion);
        setInitial(fusion);
        setDerniereSauvegarde(new Date());
      }
      addToast("success", "Paramètres et préférences enregistrés avec succès !");
    } catch (err) {
      addToast("error", messageErreur(err, "Erreur lors de l'enregistrement des paramètres."));
    } finally {
      setSaving(false);
    }
  };

  const styleAnnonce =
    STYLES_ANNONCE.find((s) => s.val === form.annonce_style) ?? STYLES_ANNONCE[0];
  const maintenanceActiveEnregistree = initial.mode_maintenance === "1";

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: "general", label: "Général", icon: <Globe size={15} /> },
    ...(isAdmin
      ? [
          { key: "site" as const, label: "Annonce & réseaux", icon: <Megaphone size={15} /> },
          { key: "pedagogie" as const, label: "Pédagogie & Inscriptions", icon: <GraduationCap size={15} /> },
        ]
      : []),
    { key: "notifications", label: "Notifications & Alertes", icon: <Bell size={15} /> },
    { key: "securite", label: "Sécurité & Sessions", icon: <Shield size={15} /> },
  ];

  const boutonEnregistrer = (libelle: string) => (
    <button
      type="button"
      onClick={() => handleSubmit()}
      disabled={saving || loading || (isAdmin && !modifie)}
      className="tely-btn"
    >
      {saving ? (
        <span className="inline-block h-3.5 w-28 bg-white/30 rounded animate-pulse" aria-label="Enregistrement en cours" />
      ) : (
        <>
          <Save size={15} /> {libelle}
        </>
      )}
    </button>
  );

  return (
    <div className={embedded ? "space-y-6" : "p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"}>
      {/* ── En-tête ── */}
      <div className="tely-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gray-50 text-gray-900 flex items-center justify-center font-bold shrink-0">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="tely-h1">
              {isAdmin ? "Paramètres de la Plateforme" : "Paramètres & Préférences"}
            </h1>
            <p className="tely-subtitle">
              {isAdmin
                ? "Configurez le fonctionnement global du site, les accès pédagogiques et les notifications."
                : "Gérez vos options de réception des alertes et préférences de compte."}
            </p>
            {isAdmin && derniereSauvegarde && !modifie && (
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1" aria-live="polite">
                <CheckCircle2 size={12} /> Enregistré à{" "}
                {derniereSauvegarde.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        <div className="self-start sm:self-auto">{boutonEnregistrer("Enregistrer les réglages")}</div>
      </div>

      {/* ── Avertissement maintenance active ── */}
      {isAdmin && !loading && maintenanceActiveEnregistree && (
        <div
          role="alert"
          className="tely-card border-l-4 border-red-500 p-4 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Le site est actuellement en maintenance</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Les visiteurs et les élèves voient le message de maintenance au lieu du site. Pensez à désactiver ce mode
              dès la fin de vos opérations (onglet Général).
            </p>
          </div>
        </div>
      )}

      {/* ── Onglets de Navigation ── */}
      <div
        role="tablist"
        aria-label="Sections des paramètres"
        className="tely-card flex items-center gap-1.5 overflow-x-auto p-2 no-scrollbar text-xs"
      >
        {tabs.map((tab) => {
          const nbErreursOnglet = isAdmin
            ? Object.keys(erreurs).filter((k) => ongletDeCle(k) === tab.key).length
            : 0;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${uid}-tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`${uid}-panel`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 [&_svg]:text-gray-900"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {nbErreursOnglet > 0 && (
                <span
                  className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                  aria-label={`${nbErreursOnglet} erreur(s)`}
                >
                  {nbErreursOnglet}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Formulaire des Paramètres ── */}
      {loading ? (
        <div className="tely-card p-6 space-y-6 animate-pulse" aria-busy="true">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <div className="w-4 h-4 rounded bg-gray-200" />
            <div className="h-4 w-44 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="h-3.5 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-10 w-full bg-gray-50 rounded-[10px] border border-gray-200" />
              </div>
            ))}
          </div>
          <div>
            <div className="h-3.5 w-56 bg-gray-200 rounded mb-2" />
            <div className="h-20 w-full bg-gray-50 rounded-[10px] border border-gray-200" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${activeTab}`}
          noValidate
        >
          {/* Onglet Général */}
          {activeTab === "general" && (
            <>
              <div className="tely-card p-6 space-y-6">
                <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                  <Globe size={16} className="text-gray-900" />
                  Informations générales
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Champ id={`${uid}-site_nom`} label="Nom du service / de l'application">
                    <input
                      id={`${uid}-site_nom`}
                      type="text"
                      value={form.site_nom}
                      onChange={(e) => handleChange("site_nom", e.target.value)}
                      disabled={!isAdmin}
                      maxLength={120}
                      className="tely-input"
                    />
                  </Champ>
                </div>

                <Champ id={`${uid}-site_description`} label="Description de la plateforme (Meta / SEO)">
                  <textarea
                    id={`${uid}-site_description`}
                    rows={3}
                    value={form.site_description}
                    onChange={(e) => handleChange("site_description", e.target.value)}
                    disabled={!isAdmin}
                    maxLength={1000}
                    className="tely-input resize-none"
                  />
                </Champ>
              </div>

              {/* Contact */}
              <div className="tely-card p-6 space-y-6">
                <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                  <Phone size={16} className="text-gray-900" />
                  Contact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Champ id={`${uid}-contact_email`} label="Adresse e-mail de contact & support" erreur={erreurs.contact_email}>
                    <input
                      id={`${uid}-contact_email`}
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      disabled={!isAdmin}
                      aria-invalid={!!erreurs.contact_email}
                      aria-describedby={erreurs.contact_email ? `${uid}-contact_email-erreur` : undefined}
                      className="tely-input"
                    />
                  </Champ>
                  <Champ
                    id={`${uid}-contact_telephone`}
                    label="Téléphone de contact"
                    erreur={erreurs.contact_telephone}
                    aide="Affiché sur le site public (pied de page, page Contact)."
                  >
                    <input
                      id={`${uid}-contact_telephone`}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.contact_telephone}
                      onChange={(e) => handleChange("contact_telephone", e.target.value)}
                      disabled={!isAdmin}
                      placeholder="+224 600 00 00 00"
                      aria-invalid={!!erreurs.contact_telephone}
                      aria-describedby={
                        erreurs.contact_telephone ? `${uid}-contact_telephone-erreur` : `${uid}-contact_telephone-aide`
                      }
                      className="tely-input"
                    />
                  </Champ>
                </div>
              </div>

              {/* Maintenance */}
              {isAdmin && (
                <div
                  className={`tely-card p-6 space-y-5 ${
                    form.mode_maintenance === "1" ? "ring-2 ring-red-500/60" : ""
                  }`}
                >
                  <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                    <Wrench size={16} className="text-gray-900" />
                    Maintenance
                  </h2>

                  <LigneInterrupteur
                    titre="Mode maintenance"
                    description="Rend le site temporairement inaccessible aux visiteurs et aux élèves. Les administrateurs gardent l'accès."
                    actif={form.mode_maintenance === "1"}
                    onToggle={() => handleToggle("mode_maintenance")}
                    icon={<AlertTriangle size={15} className="text-gray-900" />}
                  />

                  {form.mode_maintenance === "1" && (
                    <p className="flex items-start gap-2 rounded-[10px] bg-red-50 px-4 py-3 text-xs text-red-700" role="status">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      {maintenanceActiveEnregistree
                        ? "Le mode maintenance est actif : le site public est actuellement fermé."
                        : "Le mode maintenance sera activé dès l'enregistrement : le site public sera fermé."}
                    </p>
                  )}

                  <Champ
                    id={`${uid}-message_maintenance`}
                    label="Message affiché pendant la maintenance"
                    aide="Laissez vide pour utiliser le message par défaut."
                  >
                    <textarea
                      id={`${uid}-message_maintenance`}
                      rows={3}
                      maxLength={1000}
                      value={form.message_maintenance}
                      onChange={(e) => handleChange("message_maintenance", e.target.value)}
                      placeholder="Nous effectuons une mise à jour. Le site revient très vite !"
                      aria-describedby={`${uid}-message_maintenance-aide`}
                      className="tely-input resize-none"
                    />
                  </Champ>
                </div>
              )}
            </>
          )}

          {/* Onglet Annonce & réseaux (Admin) */}
          {activeTab === "site" && isAdmin && (
            <>
              <div className="tely-card p-6 space-y-5">
                <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                  <Megaphone size={16} className="text-gray-900" />
                  Bannière d'annonce
                </h2>

                <LigneInterrupteur
                  titre="Afficher la bannière"
                  description="Un bandeau affiché en haut de toutes les pages du site public."
                  actif={form.annonce_active === "1"}
                  onToggle={() => handleToggle("annonce_active")}
                />

                <Champ id={`${uid}-annonce_texte`} label="Texte de l'annonce" erreur={erreurs.annonce_texte}>
                  <input
                    id={`${uid}-annonce_texte`}
                    type="text"
                    maxLength={200}
                    value={form.annonce_texte}
                    onChange={(e) => handleChange("annonce_texte", e.target.value)}
                    placeholder="Les sujets du BAC 2026 sont disponibles !"
                    aria-invalid={!!erreurs.annonce_texte}
                    aria-describedby={erreurs.annonce_texte ? `${uid}-annonce_texte-erreur` : undefined}
                    className="tely-input"
                  />
                </Champ>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Champ
                    id={`${uid}-annonce_lien`}
                    label="Lien (facultatif)"
                    erreur={erreurs.annonce_lien}
                    aide="https://…, /chemin-interne, #ancre, mailto: ou tel:"
                  >
                    <input
                      id={`${uid}-annonce_lien`}
                      type="text"
                      inputMode="url"
                      value={form.annonce_lien}
                      onChange={(e) => handleChange("annonce_lien", e.target.value)}
                      placeholder="/sujets"
                      aria-invalid={!!erreurs.annonce_lien}
                      aria-describedby={erreurs.annonce_lien ? `${uid}-annonce_lien-erreur` : `${uid}-annonce_lien-aide`}
                      className="tely-input"
                    />
                  </Champ>
                  <Champ id={`${uid}-annonce_lien_texte`} label="Libellé du lien" erreur={erreurs.annonce_lien_texte}>
                    <input
                      id={`${uid}-annonce_lien_texte`}
                      type="text"
                      maxLength={60}
                      value={form.annonce_lien_texte}
                      onChange={(e) => handleChange("annonce_lien_texte", e.target.value)}
                      placeholder="Voir les sujets"
                      aria-invalid={!!erreurs.annonce_lien_texte}
                      aria-describedby={erreurs.annonce_lien_texte ? `${uid}-annonce_lien_texte-erreur` : undefined}
                      className="tely-input"
                    />
                  </Champ>
                </div>

                <fieldset>
                  <legend className="tely-label mb-1.5">Style</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {STYLES_ANNONCE.map((s) => {
                      const choisi = form.annonce_style === s.val;
                      return (
                        <label
                          key={s.val}
                          className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-3 text-sm font-semibold cursor-pointer transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gray-900 ${
                            choisi ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${uid}-annonce_style`}
                            value={s.val}
                            checked={choisi}
                            onChange={() => handleChange("annonce_style", s.val)}
                            className="sr-only"
                          />
                          <span className={`w-5 h-5 rounded-full shrink-0 ${s.classes}`} aria-hidden="true" />
                          {s.label}
                          {choisi && <CheckCircle2 size={15} className="ml-auto text-gray-900" />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Aperçu en direct */}
                <div>
                  <p className="tely-label mb-1.5">Aperçu en direct</p>
                  <div className="rounded-[10px] border border-gray-200 overflow-hidden bg-gray-50" aria-live="polite">
                    {form.annonce_texte.trim() ? (
                      <div
                        className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm text-center ${styleAnnonce.classes} ${
                          form.annonce_active === "1" ? "" : "opacity-50"
                        }`}
                      >
                        <span className="shrink-0">{styleAnnonce.icon}</span>
                        <span className="font-medium break-words min-w-0">{form.annonce_texte}</span>
                        {form.annonce_lien.trim() && form.annonce_lien_texte.trim() && (
                          <span className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
                            {form.annonce_lien_texte}
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-xs text-gray-400 text-center">
                        Saisissez un texte pour voir l'aperçu de la bannière.
                      </p>
                    )}
                    <div className="px-4 py-3 flex items-center gap-2" aria-hidden="true">
                      <div className="h-2.5 w-20 rounded bg-gray-200" />
                      <div className="h-2.5 w-12 rounded bg-gray-200 ml-auto" />
                      <div className="h-2.5 w-12 rounded bg-gray-200" />
                    </div>
                  </div>
                  {form.annonce_active !== "1" && form.annonce_texte.trim() && (
                    <p className="text-[11px] text-gray-400 mt-1">La bannière est désactivée : elle n'est pas visible sur le site.</p>
                  )}
                </div>
              </div>

              <div className="tely-card p-6 space-y-5">
                <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                  <Share2 size={16} className="text-gray-900" />
                  Réseaux sociaux
                </h2>
                <p className="tely-subtitle -mt-2">
                  Les liens renseignés apparaissent dans le pied de page du site. Laissez vide pour masquer un réseau.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {RESEAUX.map((r) => (
                    <Champ key={r.key} id={`${uid}-${r.key}`} label={r.label} erreur={erreurs[r.key]}>
                      <input
                        id={`${uid}-${r.key}`}
                        type="url"
                        inputMode="url"
                        value={form[r.key]}
                        onChange={(e) => handleChange(r.key, e.target.value)}
                        placeholder={r.placeholder}
                        aria-invalid={!!erreurs[r.key]}
                        aria-describedby={erreurs[r.key] ? `${uid}-${r.key}-erreur` : undefined}
                        className="tely-input"
                      />
                    </Champ>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Onglet Pédagogie (Admin) */}
          {activeTab === "pedagogie" && isAdmin && (
            <div className="tely-card p-6 space-y-6">
              <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                <GraduationCap size={16} className="text-gray-900" />
                Règles d'inscription et de production pédagogique
              </h2>

              <div className="space-y-4">
                <LigneInterrupteur
                  titre="Inscriptions des élèves ouvertes"
                  description="Permet aux apprenants de créer librement un compte pour accéder aux exercices."
                  actif={form.inscriptions_ouvertes === "1"}
                  onToggle={() => handleToggle("inscriptions_ouvertes")}
                />
                <LigneInterrupteur
                  titre="Formulaire de recrutement enseignant actif"
                  description="Affiche la section de candidature sur la page d'accueil pour attirer de nouveaux professeurs."
                  actif={form.candidatures_ouvertes === "1"}
                  onToggle={() => handleToggle("candidatures_ouvertes")}
                />
                <LigneInterrupteur
                  titre="Exiger un corrigé pour chaque exercice publié"
                  description="Empêche la validation d'un exercice si une solution détaillée n'est pas fournie."
                  actif={form.correction_obligatoire === "1"}
                  onToggle={() => handleToggle("correction_obligatoire")}
                />

                <Champ id={`${uid}-taille`} label="Taille maximale autorisée pour les documents PDF (en Mo)">
                  <input
                    id={`${uid}-taille`}
                    type="number"
                    min="5"
                    max="100"
                    value={form.taille_max_fichier_mo}
                    onChange={(e) => handleChange("taille_max_fichier_mo", e.target.value)}
                    className="tely-input w-48"
                  />
                </Champ>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === "notifications" && (
            <div className="tely-card p-6 space-y-6">
              <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                <Bell size={16} className="text-gray-900" />
                Canaux d'alertes & notifications
              </h2>

              <div className="space-y-4">
                <LigneInterrupteur
                  titre="Notifications d'activités dans l'application"
                  description="Afficher les alertes dans la cloche du haut d'écran en temps réel."
                  actif={form.alertes_navigateur === "1"}
                  onToggle={() => handleToggle("alertes_navigateur")}
                />
                {isAdmin && (
                  <LigneInterrupteur
                    titre="Email d'alerte lors d'une candidature professeur"
                    description="Envoyer automatiquement un récapitulatif à l'administrateur dès qu'un enseignant postule."
                    actif={form.notif_email_candidature === "1"}
                    onToggle={() => handleToggle("notif_email_candidature")}
                  />
                )}
                <LigneInterrupteur
                  titre="Email récapitulatif des nouveaux exercices"
                  description="Recevoir une synthèse hebdomadaire des épreuves et corrections ajoutées."
                  actif={form.notif_email_exercice === "1"}
                  onToggle={() => handleToggle("notif_email_exercice")}
                />
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "securite" && (
            <div className="tely-card p-6 space-y-6">
              <h2 className="tely-title text-lg border-b border-gray-200 pb-3 flex items-center gap-2">
                <Shield size={16} className="text-gray-900" />
                Sécurité des comptes & Sessions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Champ id={`${uid}-mdp`} label="Longueur minimale des mots de passe">
                  <select
                    id={`${uid}-mdp`}
                    value={form.longueur_min_mdp}
                    onChange={(e) => handleChange("longueur_min_mdp", e.target.value)}
                    disabled={!isAdmin}
                    className="tely-input"
                  >
                    <option value="6">6 caractères</option>
                    <option value="8">8 caractères (recommandé)</option>
                    <option value="10">10 caractères</option>
                    <option value="12">12 caractères (haute sécurité)</option>
                  </select>
                </Champ>

                <Champ id={`${uid}-session`} label="Expiration de session pour inactivité">
                  <select
                    id={`${uid}-session`}
                    value={form.expiration_session_min}
                    onChange={(e) => handleChange("expiration_session_min", e.target.value)}
                    disabled={!isAdmin}
                    className="tely-input"
                  >
                    <option value="60">1 heure</option>
                    <option value="120">2 heures</option>
                    <option value="480">8 heures</option>
                    <option value="1440">24 heures</option>
                  </select>
                </Champ>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-gray-900 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Authentification Google One Tap active</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Les utilisateurs peuvent se connecter en un clic avec leur compte Google de manière chiffrée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde inférieur (non-admin) / espace pour la barre collante (admin) */}
          {!isAdmin && (
            <div className="flex items-center justify-end gap-3 pt-2">
              {boutonEnregistrer("Enregistrer les modifications")}
            </div>
          )}
        </form>
      )}

      {/* ── Barre collante : modifications non enregistrées ── */}
      {isAdmin && modifie && (
        <div
          role="region"
          aria-label="Modifications non enregistrées"
          className="sticky bottom-3 z-20 tely-card tely-animate flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-gray-200"
        >
          <p className="text-sm text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
            <span>
              <strong>{clesModifiees.length}</strong> modification{clesModifiees.length > 1 ? "s" : ""} non
              enregistrée{clesModifiees.length > 1 ? "s" : ""}
              {nbErreurs > 0 && (
                <span className="text-red-500"> · {nbErreurs} champ{nbErreurs > 1 ? "s" : ""} à corriger</span>
              )}
            </span>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={annulerModifications} disabled={saving} className="tely-btn-outline py-2.5 flex-1 sm:flex-none">
              <RotateCcw size={15} /> Annuler
            </button>
            <button type="button" onClick={() => handleSubmit()} disabled={saving} className="tely-btn py-2.5 flex-1 sm:flex-none">
              <Save size={15} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmMaintenanceOpen}
        title="Activer le mode maintenance ?"
        description="Après enregistrement, le site public sera inaccessible aux visiteurs et aux élèves jusqu'à la désactivation du mode maintenance."
        confirmLabel="Activer"
        variant="warning"
        onConfirm={() => {
          setForm((prev) => ({ ...prev, mode_maintenance: "1" }));
          setConfirmMaintenanceOpen(false);
        }}
        onCancel={() => setConfirmMaintenanceOpen(false)}
      />
    </div>
  );
}
