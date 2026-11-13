import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { getProfesseurStats } from "../../services/resourceService";
import type { ProfesseurStats } from "../../types/admin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import {
  BookOpen,
  FileText,
  ClipboardList,
  CheckCircle2,
  Plus,
  Download,
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

  const nomEnseignant = user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : "Cher collègue";

  return (
    <div className="flex flex-col gap-7 pb-8">
      {/* ── Bannière Enseignant avec image de fond ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-sm min-h-[160px] flex flex-col md:flex-row md:items-center md:justify-between p-6 sm:p-8 gap-5">
        {/* Image de fond avec fondu et opacité */}
        <div
          className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/banner3.png')" }}
        />
        {/* Dégradé par-dessus pour assurer la lisibilité parfaite du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-700/95 via-amber-600/85 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Espace Pédagogique Enseignant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bonjour, {nomEnseignant} !</h1>
          <p className="text-sm text-amber-100/90 mt-1.5 leading-relaxed">
            Rédigez de nouveaux exercices, publiez des fiches de cours au format PDF et proposez des épreuves d'examen officielles.
          </p>
        </div>

        {/* Boutons d'action rapide */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate("/Dashboard-professeur/exercices")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-amber-600 font-semibold text-xs sm:text-sm rounded-xl hover:bg-amber-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            Nouvel exercice
          </button>
          <button
            onClick={() => navigate("/Dashboard-professeur/ressources")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-700/70 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer border border-amber-400/30 whitespace-nowrap"
          >
            <FileText size={15} />
            Déposer un document PDF
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Mes exercices rédigés"
          value={counts.mes_exercices}
          percent={5.0}
          bgColor="bg-amber-50"
          loading={loading}
        />
        <StatCard
          label="Mes ressources (PDFs)"
          value={counts.mes_ressources}
          percent={12.0}
          bgColor="bg-emerald-50"
          loading={loading}
        />
        <StatCard
          label="Sujets d'examen officiels"
          value={counts.sujets}
          percent={8.5}
          bgColor="bg-purple-50"
          loading={loading}
        />
        <StatCard
          label="Corrigés enregistrés"
          value={counts.corrections}
          percent={2.4}
          bgColor="bg-sky-50"
          loading={loading}
        />
      </div>

      {/* ── Grille 2 colonnes : Mes Exercices & Mes Documents PDF ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes derniers exercices */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mes récents exercices</h3>
                  <p className="text-xs text-gray-400">Travaux dirigés soumis récemment</p>
                </div>
              </div>
              <button
                onClick={() => navigate("exercices")}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Corrigé
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                          Sans corrigé
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => navigate("/Dashboard-professeur/exercices")}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              + Ajouter un exercice
            </button>
          </div>
        </div>

        {/* Mes documents & fichiers PDF */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mes ressources & documents PDF</h3>
                  <p className="text-xs text-gray-400">Fiches de cours, résumés et polycopiés</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/Dashboard-professeur/ressources")}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
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
                        className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
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

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => navigate("/Dashboard-professeur/ressources")}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              + Déposer un nouveau document
            </button>
          </div>
        </div>
      </div>

      {/* ── Sujets d'Examen & Corrigés ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Épreuves officielles d'examen</h3>
              <p className="text-xs text-gray-400">Banque des annales et sujets nationaux</p>
            </div>
          </div>
          <button
            onClick={() => navigate("sujets")}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            Consulter la banque
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="h-4 w-20 rounded-full bg-purple-100" />
                  <div className="h-3.5 w-4/5 bg-gray-200 rounded mt-2.5" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded mt-1.5" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-3 w-20 bg-amber-100 rounded" />
                  <div className="h-3 w-12 bg-amber-100 rounded" />
                </div>
              </div>
            ))
          ) : (
            (stats?.derniers_sujets ?? []).map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-amber-50/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {s.type} {s.annee}
                </span>
                <p className="text-xs font-bold text-gray-800 mt-2 line-clamp-1">{s.titre}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {s.matiere?.nom} • {s.niveau?.libelle}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-amber-600 font-medium">
                <span>Session {s.session}</span>
                <button
                  type="button"
                  onClick={() => navigate("sujets")}
                  className="hover:underline"
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
