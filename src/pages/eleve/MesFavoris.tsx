import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, RefreshCw, Compass } from "lucide-react";
import { getFavoris, messageErreur } from "../../services/eleveService";
import type { EntreeHistorique } from "../../types/eleve";
import ExerciceMiniCard, { ExerciceMiniCardSkeleton } from "../../components/eleve/ExerciceMiniCard";
import Pagination from "../../components/eleve/Pagination";
import { tempsRelatif } from "../../components/eleve/dates";

export default function MesFavoris() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [items, setItems] = useState<EntreeHistorique[] | null>(null);
  const [derniere, setDerniere] = useState(1);
  const [total, setTotal] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let annule = false;
    getFavoris(page)
      .then((res) => {
        if (annule) return;
        // Page devenue vide (ex. après retraits) : revenir à la dernière page existante
        if (res.data.length === 0 && page > 1 && res.last_page < page) {
          setParams(res.last_page > 1 ? { page: String(res.last_page) } : {}, { replace: true });
          return;
        }
        setItems(res.data);
        setDerniere(res.last_page || 1);
        setTotal(res.total ?? res.data.length);
        setErreur(null);
      })
      .catch((err) => {
        if (!annule) setErreur(messageErreur(err, "Impossible de charger vos favoris."));
      });
    return () => {
      annule = true;
    };
  }, [page, version, setParams]);

  function allerPage(p: number) {
    setItems(null);
    setParams(p > 1 ? { page: String(p) } : {});
    document.getElementById("contenu-eleve")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retirer(id: number) {
    const reste = (items ?? []).filter((f) => f.exercice_id !== id);
    setTotal((t) => Math.max(0, t - 1));
    if (reste.length === 0 && (page > 1 || derniere > 1)) {
      // Plus rien sur cette page : on recharge pour récupérer la suite
      setItems(null);
      setVersion((v) => v + 1);
      return;
    }
    setItems(reste);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="tely-h1 text-2xl">Mes favoris</h1>
          <p className="tely-subtitle mt-1">
            {items && total > 0
              ? `${total} exercice${total > 1 ? "s" : ""} enregistré${total > 1 ? "s" : ""} · touchez le cœur pour retirer`
              : "Vos exercices mis de côté pour plus tard"}
          </p>
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
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ExerciceMiniCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="tely-card p-8 sm:p-12 text-center tely-animate">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <Heart size={26} aria-hidden="true" />
          </div>
          <h2 className="tely-title text-lg">Aucun favori pour l'instant</h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Touchez le cœur sur un exercice pour le retrouver ici en un clic, idéal pour vos révisions d'avant contrôle.
          </p>
          <Link to="/exercices" className="tely-btn mt-5">
            <Compass size={16} aria-hidden="true" /> Explorer les exercices
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {items.map((f) =>
              f.exercice ? (
                <ExerciceMiniCard
                  key={f.id}
                  exercice={f.exercice}
                  meta={`Ajouté ${tempsRelatif(f.date_consultation)}`}
                  onFavoriChange={(favori) => {
                    if (!favori) retirer(f.exercice_id);
                  }}
                />
              ) : null
            )}
          </div>
          <Pagination page={page} derniere={derniere} onChange={allerPage} />
        </>
      )}
    </div>
  );
}
