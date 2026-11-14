import { useEffect, useState } from "react";
import StatCard from "../components/ui/StatCard";
import { getAdminStats } from "../services/resourceService";
import type { AdminStats } from "../types/admin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ATraiter, ActionsRapides, DashboardHeader } from "../components/dashboard/DashboardHome";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  EyeOff,
  Plus,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DIFFICULTE_COLORS: Record<string, string> = {
  facile: "#10b981",
  moyen: "#f59e0b",
  difficile: "#ef4444",
};

export default function OverView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    getAdminStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch(() => {
        // Fallback or error handled silently
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = stats?.counts ?? {
    eleves: 0,
    professeurs: 0,
    exercices: 0,
    sujets: 0,
    matieres: 0,
    niveaux: 0,
    categories: 0,
    corrections: 0,
    users: 0,
  };

  const aTraiter = stats?.a_traiter;

  const matiereChartData = (stats?.exercices_par_matiere ?? []).map((m) => ({
    name: m.nom,
    code: m.code,
    total: m.exercices_count,
  }));

  return (
    <div className="flex flex-col gap-7 pb-8 w-full max-w-full overflow-x-hidden min-w-0">
      {/* ── Accueil orienté actions ── */}
      <DashboardHeader
        prenom={user?.prenom}
        sousTitre="Voici l'état de la plateforme et ce qui demande votre attention."
        action={
          <button type="button" onClick={() => navigate("/Dashbord-admin/exercices/nouveau")} className="tely-btn">
            <Plus size={16} /> Nouvel exercice
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <ATraiter
            loading={loading}
            taches={[
              {
                count: aTraiter?.candidatures_en_attente ?? 0,
                label: "candidature(s) enseignant en attente",
                description: "Des enseignants attendent votre validation pour publier.",
                to: "/Dashbord-admin/candidatures",
                priorite: "urgent",
                icon: <UserCheck size={18} />,
              },
              {
                count: aTraiter?.exercices_sans_corrige ?? 0,
                label: "exercice(s) sans corrigé",
                description: "Les élèves ne peuvent pas vérifier leurs réponses sur ces exercices.",
                to: "/Dashbord-admin/corrections",
                icon: <CheckCircle2 size={18} />,
              },
              {
                count: aTraiter?.sujets_sans_exercice ?? 0,
                label: "sujet(s) d'examen sans exercice",
                description: "Associez des exercices pour rendre ces sujets exploitables.",
                to: "/Dashbord-admin/sujets",
                icon: <ClipboardList size={18} />,
              },
              {
                count: aTraiter?.exercices_inactifs ?? 0,
                label: "exercice(s) désactivé(s)",
                description: "Invisibles pour les élèves : à publier ou à supprimer.",
                to: "/Dashbord-admin/exercices",
                icon: <EyeOff size={18} />,
              },
              {
                count: aTraiter?.nouveaux_inscrits_7j ?? 0,
                label: "nouvel(le)s inscrit(e)s cette semaine",
                description: "Vérifiez les comptes et attribuez les bons rôles.",
                to: "/Dashbord-admin/utilisateurs",
                icon: <Users size={18} />,
              },
            ]}
          />
        </div>
        <ActionsRapides
          actions={[
            { label: "Créer un compte", to: "/Dashbord-admin/utilisateurs", icon: <UserPlus size={18} /> },
            { label: "Nouvel exercice", to: "/Dashbord-admin/exercices/nouveau", icon: <BookOpen size={18} /> },
            { label: "Nouveau sujet", to: "/Dashbord-admin/sujets/nouveau", icon: <ClipboardList size={18} /> },
            { label: "Statistiques", to: "/Dashbord-admin/statistiques", icon: <TrendingUp size={18} /> },
          ]}
        />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard label="Élèves inscrits" value={counts.eleves} bgColor="bg-amber-50" loading={loading} />
        <StatCard label="Professeurs" value={counts.professeurs} bgColor="bg-emerald-50" loading={loading} />
        <StatCard label="Exercices actifs" value={counts.exercices} bgColor="bg-red-50" loading={loading} />
        <StatCard label="Sujets d'examen" value={counts.sujets} bgColor="bg-gray-50" loading={loading} />
        <StatCard label="Matières actives" value={counts.matieres} bgColor="bg-gray-50" loading={loading} />
      </div>

      {/* ── Graphiques & Répartition ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        {/* Exercices par Matière */}
        <div className="lg:col-span-2 tely-card p-5 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="tely-title text-lg">Exercices par matière</h3>
              <p className="tely-subtitle">Distribution du volume de TD par discipline</p>
            </div>
            <span className="tely-overline">
              Total {counts.exercices}
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-end justify-between gap-4 px-4 pb-6 pt-4 animate-pulse">
                {[45, 75, 55, 90, 60, 80, 40].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full max-w-[42px] bg-gray-200 rounded-t-md"
                      style={{ height: `${h}%` }}
                    />
                    <div className="h-2.5 w-10 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : matiereChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Aucune donnée d'exercices disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matiereChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.75rem",
                      border: "1px solid #f3f4f6",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {matiereChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#111827" : "#D1D5DB"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Répartition par difficulté */}
        <div className="tely-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="tely-title text-lg mb-1">Niveau de difficulté</h3>
            <p className="tely-subtitle mb-4">Proportion des exercices selon l'exigence</p>

            <div className="space-y-4">
              {["facile", "moyen", "difficile"].map((diff) => {
                const total = counts.exercices || 1;
                const value = (stats?.exercices_par_difficulte?.[diff] ?? 0);
                const percent = Math.round((value / total) * 100);
                const color = DIFFICULTE_COLORS[diff];

                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="capitalize font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        {diff}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {value} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-[10px] p-3">
            <span className="tely-label block">Taux de correction</span>
            <p className="text-xs text-gray-600 mt-0.5">
              {counts.corrections} exercice(s) disposent d'un corrigé détaillé officiel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Derniers Exercices et Derniers Sujets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers Exercices */}
        <div className="tely-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="tely-title text-lg">Derniers exercices ajoutés</h3>
              <p className="tely-subtitle">Contenus récemment publiés</p>
            </div>
            <button
              onClick={() => navigate("/Dashbord-admin/exercices")}
              className="tely-link text-xs"
            >
              Voir tout
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="divide-y divide-gray-50 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-3/5 bg-gray-200 rounded" />
                      <div className="h-2.5 w-2/5 bg-gray-100 rounded" />
                    </div>
                    <div className="h-5 w-14 bg-gray-100 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            ) : (stats?.derniers_exercices ?? []).length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Aucun exercice pour le moment
              </div>
            ) : (
              (stats?.derniers_exercices ?? []).map((ex) => (
                <div key={ex.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{ex.titre}</p>
                    <span className="text-[11px] text-gray-400">
                      {ex.matiere?.nom ?? "—"} • {ex.niveau?.libelle ?? "—"}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold capitalize shrink-0"
                    style={{
                      color: DIFFICULTE_COLORS[ex.difficulte] ?? "#6b7280",
                    }}
                  >
                    {ex.difficulte}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Derniers Sujets d'Examen */}
        <div className="tely-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="tely-title text-lg">Derniers sujets d'examen</h3>
              <p className="tely-subtitle">Épreuves officielles enregistrées</p>
            </div>
            <button
              onClick={() => navigate("/Dashbord-admin/sujets")}
              className="tely-link text-xs"
            >
              Voir tout
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="divide-y divide-gray-50 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-3/5 bg-gray-200 rounded" />
                      <div className="h-2.5 w-2/5 bg-gray-100 rounded" />
                    </div>
                    <div className="h-5 w-14 bg-gray-100 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            ) : (stats?.derniers_sujets ?? []).length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Aucun sujet d'examen pour le moment
              </div>
            ) : (
              (stats?.derniers_sujets ?? []).map((sujet) => (
                <div key={sujet.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{sujet.titre}</p>
                    <span className="text-[11px] text-gray-400">
                      {sujet.matiere?.nom ?? "—"} • Session {sujet.session} {sujet.annee}
                    </span>
                  </div>
                  <span className="tely-chip uppercase shrink-0">
                    {sujet.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
