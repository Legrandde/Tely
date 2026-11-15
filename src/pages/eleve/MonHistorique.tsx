import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, CheckCircle2, History, RefreshCw, Compass, ChevronRight } from "lucide-react";
import { getHistorique, messageErreur } from "../../services/eleveService";
import type { EntreeHistorique } from "../../types/eleve";
import Pagination from "../../components/eleve/Pagination";
import FavoriButton from "../../components/eleve/FavoriButton";
import { cleGroupeJour, heure, libelleGroupeJour } from "../../components/eleve/dates";

type Filtre = "tout" | "consulte" | "correction_vue";

const FILTRES: Array<{ valeur: Filtre; label: string }> = [
  { valeur: "tout", label: "Tout" },
  { valeur: "consulte", label: "Consultés" },
  { valeur: "correction_vue", label: "Corrigés vus" },
];

function lireFiltre(v: string | null): Filtre {
  return v === "consulte" || v === "correction_vue" ? v : "tout";
}

export default function MonHistorique() {
  const [params, setParams] = useSearchParams();
  const filtre = lireFiltre(params.get("filtre"));
  const page = Math.max(1, Number(params.get("page")) || 1);
  const cle = `${filtre}:${page}`;

  const [resultat, setResultat] = useState<{ cle: string; items: EntreeHistorique[]; derniere: number; total: number } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let annule = false;
    getHistorique({ action: filtre === "tout" ? undefined : filtre, page })
      .then((res) => {
        if (annule) return;
        setResultat({ cle, items: res.data, derniere: res.last_page || 1, total: res.total ?? res.data.length });
        setErreur(null);
      })
      .catch((err) => {
        if (!annule) setErreur(messageErreur(err, "Impossible de charger votre historique."));
      });
    return () => {
      annule = true;
    };
  }, [filtre, page, cle, version]);

  // Données correspondant aux paramètres courants (sinon : chargement)
  const items = resultat?.cle === cle ? resultat.items : null;

  const groupes = useMemo(() => {
    const map = new Map<string, { libelle: string; entrees: EntreeHistorique[] }>();
    (items ?? []).forEach((e) => {
      const k = cleGroupeJour(e.date_consultation);
      if (!map.has(k)) map.set(k, { libelle: libelleGroupeJour(e.date_consultation), entrees: [] });
      map.get(k)!.entrees.push(e);
    });
    return [...map.entries()];
  }, [items]);

  function changer(nouveau: { filtre?: Filtre; page?: number }) {
    const f = nouveau.filtre ?? filtre;
    const p = nouveau.page ?? 1;
    const suivant: Record<string, string> = {};
    if (f !== "tout") suivant.filtre = f;
    if (p > 1) suivant.page = String(p);
    setParams(suivant);
    document.getElementById("contenu-eleve")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="tely-h1 text-2xl">Historique</h1>
          <p className="tely-subtitle mt-1">Tout ce que vous avez travaillé, jour après jour</p>
        </div>
        <div role="tablist" aria-label="Filtrer l'historique" className="inline-flex bg-white rounded-[10px] p-1 border border-gray-200 self-start sm:self-auto max-w-full overflow-x-auto no-scrollbar">
          {FILTRES.map((f) => {
            const actif = f.valeur === filtre;
            return (
              <button
                key={f.valeur}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => changer({ filtre: f.valeur })}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  actif ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {erreur && !items ? (
        <div className="tely-card p-8 text-center" role="alert">
          <p className="text-sm text-gray-600">{erreur}</p>
          <button
            type="button"
            className="tely-btn-outline mt-4"
            onClick={() => {
              setErreur(null);
              setVersion((v) => v + 1);
            }}
          >
            <RefreshCw size={16} aria-hidden="true" /> Réessayer
          </button>
        </div>
      ) : !items ? (
        <div className="tely-card p-4 sm:p-5 space-y-3 animate-pulse" aria-hidden="true">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="tely-card p-8 sm:p-12 text-center tely-animate">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <History size={26} aria-hidden="true" />
          </div>
          <h2 className="tely-title text-lg">
            {filtre === "correction_vue"
              ? "Aucun corrigé consulté"
              : filtre === "consulte"
              ? "Aucun exercice consulté"
              : "Votre historique est vide"}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Ouvrez un exercice et consultez son corrigé : il apparaîtra ici pour que vous puissiez le reprendre à tout moment.
          </p>
          <Link to="/exercices" className="tely-btn mt-5">
            <Compass size={16} aria-hidden="true" /> Explorer les exercices
          </Link>
        </div>
      ) : (
        <>
          {groupes.map(([k, groupe]) => (
            <section key={k} aria-labelledby={`jour-${k}`} className="space-y-2">
              <h2 id={`jour-${k}`} className="tely-overline px-1">
                {groupe.libelle}
              </h2>
              <ul className="tely-card divide-y divide-gray-100 overflow-hidden">
                {groupe.entrees.map((e) => {
                  const corrige = e.action === "correction_vue";
                  return (
                    <li key={e.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          corrige ? "bg-amber-50 text-amber-500" : "bg-gray-50 text-gray-900"
                        }`}
                        aria-hidden="true"
                      >
                        {corrige ? <CheckCircle2 size={18} /> : <Eye size={18} />}
                      </span>
                      <Link to={`/ennoncer?id=${e.exercice_id}`} className="flex-1 min-w-0 group">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors">
                          {e.exercice?.titre ?? "Exercice"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          <span className="font-medium">{corrige ? "Corrigé vu" : "Consulté"}</span>
                          {" · "}
                          {heure(e.date_consultation)}
                          {e.exercice?.matiere?.nom && ` · ${e.exercice.matiere.nom}`}
                          {e.exercice?.niveau?.libelle && ` · ${e.exercice.niveau.libelle}`}
                        </p>
                      </Link>
                      <FavoriButton exerciceId={e.exercice_id} titre={e.exercice?.titre} className="shadow-none border border-gray-100" />
                      <ChevronRight size={16} className="text-gray-300 hidden sm:block shrink-0" aria-hidden="true" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <Pagination page={page} derniere={resultat?.derniere ?? 1} onChange={(p) => changer({ page: p })} />
        </>
      )}
    </div>
  );
}
