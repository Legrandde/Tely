import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ScrollText } from "lucide-react";
import { fetchJournal } from "../../services/backofficeService";
import type { JournalEntree } from "../../types/admin";
import { dateHeureComplete, initialesDe, tempsRelatif } from "./format";

/** Aperçu des dernières entrées du journal d'audit (vue d'ensemble admin). */
export default function ActiviteRecente({ limite = 4 }: { limite?: number }) {
  const navigate = useNavigate();
  const [entrees, setEntrees] = useState<JournalEntree[] | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;
    fetchJournal({ page: 1 })
      .then((res) => {
        if (actif) setEntrees(res.journal.data.slice(0, limite));
      })
      .catch(() => {
        if (actif) setErreur(true);
      });
    return () => {
      actif = false;
    };
  }, [limite]);

  return (
    <section className="tely-card p-5 sm:p-6 min-w-0" aria-labelledby="activite-recente-titre">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id="activite-recente-titre" className="tely-title text-xl">Activité récente</h2>
          <p className="tely-subtitle">Dernières actions sensibles du back-office</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/Dashbord-admin/journal")}
          className="tely-link text-xs flex items-center gap-1 shrink-0"
        >
          Journal d'audit <ArrowRight size={14} />
        </button>
      </div>

      {erreur ? (
        <p className="text-xs text-gray-400 py-4">Le journal est momentanément indisponible.</p>
      ) : entrees === null ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: limite }).map((_, i) => (
            <div key={i} className="h-10 rounded-[10px] bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : entrees.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[10px] bg-gray-50 px-4 py-4">
          <ScrollText size={20} className="text-gray-900 shrink-0" />
          <p className="text-xs text-gray-500">Aucune action enregistrée pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {entrees.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5">
              <span
                className="w-8 h-8 rounded-full bg-gray-900 text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {e.user ? initialesDe(e.user.prenom, e.user.nom) : "—"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{e.description}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {e.user ? `${e.user.prenom} ${e.user.nom}` : "Système"}
                </p>
              </div>
              <time
                dateTime={e.created_at}
                title={dateHeureComplete(e.created_at)}
                className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap"
              >
                {tempsRelatif(e.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
