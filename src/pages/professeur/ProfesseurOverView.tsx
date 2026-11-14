import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { getProfesseurStats } from "../../services/resourceService";
import type { ProfesseurStats } from "../../types/admin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { ATraiter, ActionsRapides, DashboardHeader } from "../../components/dashboard/DashboardHome";
import {
  BookOpen,
  FileText,
  ClipboardList,
  CheckCircle2,
  Plus,
  Download,
  EyeOff,
} from "lucide-react";

export default function ProfesseurOverView() {
  const [stats, setStats] = useState<ProfesseurStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    getProfesseurStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = stats?.counts ?? {
    mes_exercices: 0,
    mes_ressources: 0,
    sujets: 0,
    corrections: 0,
  };

  const aTraiter = stats?.a_traiter;


  return (
    <div className="flex flex-col gap-7 pb-8">
      {/* ── Accueil orienté actions ── */}
      <DashboardHeader
        prenom={user?.prenom}
        sousTitre="Vos contenus pédagogiques et ce qui reste à finaliser."
        action={
          <button type="button" onClick={() => navigate("/Dashboard-professeur/exercices/nouveau")} className="tely-btn">
            <Plus size={16} /> Nouvel exercice
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <ATraiter
            loading={loading}
            taches={[
              {
                count: aTraiter?.exercices_sans_corrige ?? 0,
                label: "exercice(s) sans corrigé",
                description:
                  aTraiter?.exercices_sans_corrige_liste?.map((e) => e.titre).join(" · ") ||
                  "Ajoutez la solution pour que vos élèves puissent se corriger.",
                to: "/Dashboard-professeur/corrections",
                priorite: "urgent",
                icon: <CheckCircle2 size={18} />,
              },
              {
                count: aTraiter?.exercices_inactifs ?? 0,
                label: "exercice(s) désactivé(s)",
                description: "Invisibles pour les élèves : à publier quand ils sont prêts.",
                to: "/Dashboard-professeur/exercices",
                icon: <EyeOff size={18} />,
              },
            ]}
          />
        </div>
        <ActionsRapides
          actions={[
            { label: "Nouvel exercice", to: "/Dashboard-professeur/exercices/nouveau", icon: <BookOpen size={18} /> },
            { label: "Ajouter un corrigé", to: "/Dashboard-professeur/corrections", icon: <CheckCircle2 size={18} /> },
            { label: "Déposer un PDF", to: "/Dashboard-professeur/ressources", icon: <FileText size={18} /> },
            { label: "Nouveau sujet", to: "/Dashboard-professeur/sujets/nouveau", icon: <ClipboardList size={18} /> },
          ]}
        />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Mes exercices rédigés"
          value={counts.mes_exercices}
          bgColor="bg-amber-50"
          loading={loading}
        />
        <StatCard
          label="Mes ressources (PDFs)"
          value={counts.mes_ressources}
          bgColor="bg-emerald-50"
          loading={loading}
        />
        <StatCard
          label="Sujets d'examen officiels"
          value={counts.sujets}
          bgColor="bg-gray-50"
          loading={loading}
        />
        <StatCard
          label="Corrigés enregistrés"
          value={counts.corrections}
          bgColor="bg-gray-50"
          loading={loading}
        />
      </div>

      {/* ── Grille 2 colonnes : Mes Exercices & Mes Documents PDF ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes derniers exercices */}
        <div className="tely-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-gray-50 text-gray-900">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="tely-title text-lg">Mes récents exercices</h3>
                  <p className="tely-subtitle">Travaux dirigés soumis récemment</p>
                </div>
              </div>
              <button
                onClick={() => navigate("exercices")}
                className="tely-link text-xs"
              >
                Gérer tout
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
                      <div className="h-5 w-16 bg-gray-100 rounded-full shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (stats?.derniers_exercices ?? []).length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Vous n'avez pas encore soumis d'exercices.
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
                    <div className="flex items-center gap-2 shrink-0">
                      {ex.correction ? (
                        <span className="tely-chip text-emerald-700">
                          <CheckCircle2 size={10} className="text-gray-900" /> Corrigé
                        </span>
                      ) : (
                        <span className="tely-chip">
                          Sans corrigé
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => navigate("/Dashboard-professeur/exercices")}
              className="tely-link text-xs flex items-center gap-1"
            >
              + Ajouter un exercice
            </button>
          </div>
        </div>

        {/* Mes documents & fichiers PDF */}
        <div className="tely-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-gray-50 text-gray-900">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="tely-title text-lg">Mes ressources & documents PDF</h3>
                  <p className="tely-subtitle">Fiches de cours, résumés et polycopiés</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/Dashboard-professeur/ressources")}
                className="tely-link text-xs"
              >
                Gérer tout
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
                      <div className="w-6 h-6 bg-gray-100 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (stats?.dernieres_ressources ?? []).length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Aucun document PDF publié pour le moment.
                </div>
              ) : (
                (stats?.dernieres_ressources ?? []).map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{doc.titre}</p>
                      <span className="text-[11px] text-gray-400">
                        {doc.matiere?.nom ?? "—"} • {doc.niveau?.libelle ?? "—"} ({doc.format?.toUpperCase() ?? "PDF"})
                      </span>
                    </div>
                    {doc.fichier_url && (
                      <a
                        href={doc.fichier_url}
                        target="_blank"
                        rel="noreferrer"
                        className="tely-icon-btn text-gray-900"
                        title="Télécharger"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => navigate("/Dashboard-professeur/ressources")}
              className="tely-link text-xs flex items-center gap-1"
            >
              + Déposer un nouveau document
            </button>
          </div>
        </div>
      </div>

      {/* ── Sujets d'Examen & Corrigés ── */}
      <div className="tely-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[10px] bg-gray-50 text-gray-900">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="tely-title text-lg">Épreuves officielles d'examen</h3>
              <p className="tely-subtitle">Banque des annales et sujets nationaux</p>
            </div>
          </div>
          <button
            onClick={() => navigate("sujets")}
            className="tely-link text-xs"
          >
            Consulter la banque
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-[10px] bg-gray-50 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="h-4 w-20 rounded-full bg-gray-200" />
                  <div className="h-3.5 w-4/5 bg-gray-200 rounded mt-2.5" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded mt-1.5" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          ) : (
            (stats?.derniers_sujets ?? []).map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-[10px] bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="tely-overline">
                  {s.type} {s.annee}
                </span>
                <p className="text-xs font-bold text-gray-800 mt-2 line-clamp-1">{s.titre}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {s.matiere?.nom} • {s.niveau?.libelle}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Session {s.session}</span>
                <button
                  type="button"
                  onClick={() => navigate("sujets")}
                  className="tely-link"
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
