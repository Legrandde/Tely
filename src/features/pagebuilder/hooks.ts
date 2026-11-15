/**
 * Données dynamiques des blocs (chargées aussi dans l'éditeur).
 */
import { useEffect, useState } from "react";
import { getSiteStats } from "../../services/pageService";
import { getExercices } from "../../services/exerciceService";
import type { Exercice } from "../../types/exercice";
import type { StatsPubliques } from "./types";

type Etat<T> = { donnees: T | null; erreur: boolean; cle: string };

export function useSiteStats(actif: boolean) {
  const [etat, setEtat] = useState<Etat<StatsPubliques>>({ donnees: null, erreur: false, cle: "" });

  useEffect(() => {
    if (!actif) return;
    let annule = false;
    getSiteStats()
      .then((s) => {
        if (!annule) setEtat({ donnees: s, erreur: false, cle: "stats" });
      })
      .catch(() => {
        if (!annule) setEtat({ donnees: null, erreur: true, cle: "stats" });
      });
    return () => {
      annule = true;
    };
  }, [actif]);

  return { stats: etat.donnees, erreur: etat.erreur, chargement: actif && etat.cle !== "stats" };
}

const cacheExercices = new Map<string, Exercice[]>();

export function useExercicesRecents(matiereId: number | null, niveauId: number | null) {
  const cle = `${matiereId ?? ""}|${niveauId ?? ""}`;
  const [etat, setEtat] = useState<Etat<Exercice[]>>(() => ({
    donnees: cacheExercices.get(cle) ?? null,
    erreur: false,
    cle: cacheExercices.has(cle) ? cle : "",
  }));

  useEffect(() => {
    let annule = false;
    const enCache = cacheExercices.get(cle);
    if (enCache) {
      queueMicrotask(() => {
        if (!annule) setEtat({ donnees: enCache, erreur: false, cle });
      });
      return () => {
        annule = true;
      };
    }
    getExercices({
      ...(matiereId ? { matiere_id: matiereId } : {}),
      ...(niveauId ? { niveau_id: niveauId } : {}),
    })
      .then((res) => {
        const liste = Array.isArray(res?.data) ? res.data : [];
        cacheExercices.set(cle, liste);
        if (!annule) setEtat({ donnees: liste, erreur: false, cle });
      })
      .catch(() => {
        if (!annule) setEtat({ donnees: null, erreur: true, cle });
      });
    return () => {
      annule = true;
    };
  }, [cle, matiereId, niveauId]);

  const aJour = etat.cle === cle;
  return {
    exercices: aJour ? etat.donnees : null,
    erreur: aJour && etat.erreur,
    chargement: !aJour,
  };
}
