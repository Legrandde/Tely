import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CourseDetailSkeleton from "../components/CourseDetailSkeleton";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  BarChart2,
  FileText,
  Download,
  Lock,
  Award,
  Laptop,
  Layers,
  Copy,
  Mail,
  MessageCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Header from "../components/ui/Header";
import { getExercice } from "../services/exerciceService";

import type { Exercice } from "../types/exercice";
import { useAuth } from "../context/authContext";

// ── Types ────────────────────────────────────────────────────────────────

type Tab = "Énoncé" | "Corrigé" | "Ressources";
const TABS: Tab[] = ["Énoncé", "Corrigé", "Ressources"];

interface IncludeItem {
  icon: LucideIcon;
  label: string;
}

const INCLUDES: IncludeItem[] = [
  { icon: FileText, label: "Énoncé complet, consultable en ligne" },
  { icon: Lock, label: "Corrigé détaillé étape par étape" },
  { icon: Clock, label: "Accès illimité, à ton rythme" },
  { icon: Award, label: "Progression suivie sur ton profil" },
  { icon: Laptop, label: "Accessible sur mobile, tablette et ordinateur" },
  { icon: Layers, label: "100% en ligne, adapté au programme sénégalais" },
];

const SHARE_BUTTONS: IncludeItem[] = [
  { icon: Copy, label: "Copier le lien" },
  { icon: Mail, label: "Email" },
  { icon: MessageCircle, label: "WhatsApp" },
];

const DIFFICULTE_LABELS: Record<string, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};

const TYPE_LABELS: Record<string, string> = {
  classique: "Exercice classique",
  qcm: "QCM",
  probleme: "Problème",
  sujet_examen: "Sujet d'examen",
};

// ── Longueur d'aperçu de l'énoncé pour les non-connectés ──────────────────
const APERCU_LONGUEUR = 350;

// ── Sous-composants ──────────────────────────────────────────────────────

interface RowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function Row({ icon: Icon, label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-500">
        <Icon size={15} className="text-orange-500" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciceId = searchParams.get("id");

  const { isAuthenticated } = useAuth();

  const [exercice, setExercice] = useState<Exercice | null>(null);
  const [loading, setLoading] = useState(!!exerciceId);
  const [error, setError] = useState<string | undefined>(!exerciceId ? "Aucun exercice sélectionné." : undefined);
  const [activeTab, setActiveTab] = useState<Tab>("Énoncé");

  useEffect(() => {
    if (!exerciceId) return;

    let cancelled = false;

    getExercice(exerciceId)
      .then((data) => {
        if (!cancelled) {
          setExercice(data);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger cet exercice.";
          setError(errorMsg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [exerciceId]);

  // Fonctions de navigation vers login/signup avec message contextuel
  function redirigerVersConnexion(raison?: string) {
    navigate("/auth/login", { state: { from: location.pathname, raison } });
  }

  function gererActionProtegee(raison: string, action: () => void) {
    if (!isAuthenticated) {
      redirigerVersConnexion(raison);
      return;
    }
    action();
  }

  // ── États de chargement / erreur ────────────────────────────────────────
  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="px-8 pt-4">
        <Header />
      </div>
      <CourseDetailSkeleton />
    </div>
  );
}

  if (error || !exercice) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="px-8 pt-4">
          <Header />
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-500">
            {error ?? "Exercice introuvable."}
          </p>
          <button
            onClick={() => navigate("/exercices")}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 mt-3"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }

  const auteur = exercice.professeur?.user
    ? `${exercice.professeur.user.prenom} ${exercice.professeur.user.nom}`.trim()
    : "Professeur";

  const enonceCourt = exercice.enonce.length > APERCU_LONGUEUR;
  const enonceVisible = isAuthenticated || !enonceCourt
    ? exercice.enonce
    : exercice.enonce.slice(0, APERCU_LONGUEUR);

  const correction = (exercice as unknown as { correction?: { contenu?: string; explication?: string } })?.correction;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="px-8 pt-4">
        <Header />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Left column */}
        <div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded uppercase tracking-wide">
            {exercice.matiere?.nom} • {exercice.niveau?.libelle}
          </span>

          <h1 className="text-3xl font-bold leading-snug mt-3">
            {exercice.titre}
          </h1>

          {/* Auteur */}
          <div className="flex items-center gap-3 mt-4">
            {exercice.professeur?.user?.avatar ? (
              <img
                src={exercice.professeur.user.avatar}
                alt={auteur}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-semibold">
                {auteur.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-sm">
              <p className="text-gray-400 leading-none">Proposé par :</p>
              <p className="font-medium">{auteur}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mt-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 -bottom-px w-full h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="mt-6">
            {activeTab === "Énoncé" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Énoncé</h2>

                <div className="relative">
                  <p
                    className={`text-gray-700 leading-relaxed whitespace-pre-line ${
                      !isAuthenticated && enonceCourt ? "blur-[1.5px] select-none" : ""
                    }`}
                  >
                    {enonceVisible}
                    {!isAuthenticated && enonceCourt ? "…" : ""}
                  </p>

                  {!isAuthenticated && enonceCourt && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-2">
                      <button
                        onClick={() =>
                          redirigerVersConnexion(
                            "Connecte-toi pour lire la suite de l'énoncé."
                          )
                        }
                        className="flex items-center gap-2 bg-white border border-orange-200 shadow-sm text-orange-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <Lock size={14} />
                        Débloquer la suite de l'énoncé
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Corrigé" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Corrigé</h2>
                {!isAuthenticated ? (
                  <div className="flex flex-col items-center text-center py-10 text-gray-500">
                    <Lock size={28} className="mb-3 text-orange-500" />
                    <p className="font-medium">
                      Le corrigé est réservé aux élèves connectés.
                    </p>
                    <p className="text-sm mt-1 mb-4">
                      Connecte-toi pour débloquer la correction détaillée.
                    </p>
                    <button
                      onClick={() =>
                        redirigerVersConnexion(
                          "Connecte-toi pour accéder au corrigé de cet exercice."
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Se connecter
                    </button>
                  </div>
                ) : correction?.contenu ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {correction.contenu}
                    </p>
                    {correction.explication && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Explication
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {correction.explication}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-10 text-gray-500">
                    <Lock size={28} className="mb-3 text-orange-500" />
                    <p className="font-medium">
                      Aucun corrigé disponible pour l'instant.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Ressources" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Ressources</h2>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText size={16} className="text-orange-500" />
                      Énoncé complet
                    </span>
                    <button
                      onClick={() =>
                        gererActionProtegee(
                          "Connecte-toi pour télécharger les ressources.",
                          () => console.log("Téléchargement de l'énoncé")
                        )
                      }
                      className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      {isAuthenticated ? <Download size={14} /> : <Lock size={14} />}
                      Télécharger
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar droite */}
        <aside>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">
                {TYPE_LABELS[exercice.type] ?? exercice.type}
              </span>
              <span
                className={`ml-auto text-xs font-medium px-2 py-1 rounded ${
                  exercice.est_actif
                    ? "text-emerald-600 bg-emerald-100"
                    : "text-gray-500 bg-gray-100"
                }`}
              >
                {exercice.est_actif ? "Actif" : "Inactif"}
              </span>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <Row
                icon={BarChart2}
                label="Difficulté"
                value={DIFFICULTE_LABELS[exercice.difficulte] ?? exercice.difficulte}
              />
              <Row
                icon={FileText}
                label="Niveau"
                value={exercice.niveau?.libelle ?? "—"}
              />
              <Row
                icon={FileText}
                label="Matière"
                value={exercice.matiere?.nom ?? "—"}
              />
            </dl>

            <button
              onClick={() =>
                gererActionProtegee(
                  "Connecte-toi pour accéder au corrigé de cet exercice.",
                  () => setActiveTab("Corrigé")
                )
              }
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-600 font-medium py-2.5 rounded-lg mt-6 transition-colors flex items-center justify-center gap-2"
            >
              {!isAuthenticated && <Lock size={14} />}
              Voir le corrigé
            </button>

            {!isAuthenticated && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                  <Sparkles size={13} className="text-orange-500" />
                  Connecte-toi
                </p>
                <p>
                  Accède à tous les énoncés, corrigés et suis ta progression.
                </p>
                <button
                  onClick={() =>
                    redirigerVersConnexion(
                      "Connecte-toi pour profiter de tous les exercices."
                    )
                  }
                  className="inline-block mt-2 font-medium text-orange-600 hover:text-orange-700"
                >
                  Se connecter →
                </button>
              </div>
            )}

            <hr className="my-5 border-gray-200" />

            <p className="text-sm font-semibold mb-3">Cet exercice comprend :</p>
            <ul className="space-y-2.5">
              {INCLUDES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Icon size={15} className="text-orange-500 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>

            <hr className="my-5 border-gray-200" />

            <p className="text-sm font-semibold mb-3">Partager cet exercice :</p>
            <div className="flex gap-2 flex-wrap">
              {SHARE_BUTTONS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  title={label}
                  onClick={() => {
                    if (label === "Copier le lien") {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}