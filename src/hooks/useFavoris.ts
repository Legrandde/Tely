import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../context/authContext";
import { basculerFavori, getFavorisIds } from "../services/eleveService";

/**
 * Cache module des favoris de l'élève connecté, partagé par tous les composants
 * (cartes, page détail, page « Mes favoris ») sans Provider global.
 */
interface EtatFavoris {
  userId: number | null;
  ids: Set<number>;
  charge: boolean;
}

let etat: EtatFavoris = { userId: null, ids: new Set(), charge: false };
let chargement: Promise<void> | null = null;
const abonnes = new Set<() => void>();

function emettre(nouvelEtat: EtatFavoris) {
  etat = nouvelEtat;
  abonnes.forEach((fn) => fn());
}

function sAbonner(fn: () => void) {
  abonnes.add(fn);
  return () => {
    abonnes.delete(fn);
  };
}

function lireEtat() {
  return etat;
}

function chargerPour(userId: number) {
  if (etat.userId === userId && (etat.charge || chargement)) return;
  emettre({ userId, ids: new Set(), charge: false });
  const promesse = getFavorisIds()
    .then((ids) => {
      if (etat.userId === userId) emettre({ userId, ids: new Set(ids), charge: true });
    })
    .catch(() => {
      // Silencieux : les cœurs restent vides, un nouveau clic réessaiera
      if (etat.userId === userId) emettre({ ...etat, charge: true });
    })
    .finally(() => {
      if (chargement === promesse) chargement = null;
    });
  chargement = promesse;
}

function definir(exerciceId: number, favori: boolean) {
  const ids = new Set(etat.ids);
  if (favori) ids.add(exerciceId);
  else ids.delete(exerciceId);
  emettre({ ...etat, ids });
}

/** Vide le cache (déconnexion, suppression de compte). */
export function reinitialiserFavoris() {
  chargement = null;
  emettre({ userId: null, ids: new Set(), charge: false });
}

export function useFavoris() {
  const { user } = useAuth();
  const estEleve = user?.role === "eleve";
  const userId = estEleve ? user.id : null;
  const courant = useSyncExternalStore(sAbonner, lireEtat, lireEtat);

  useEffect(() => {
    if (userId !== null) chargerPour(userId);
    else if (etat.userId !== null) reinitialiserFavoris();
  }, [userId]);

  const estFavori = useCallback(
    (exerciceId: number) => courant.userId === userId && courant.ids.has(exerciceId),
    [courant, userId]
  );

  /**
   * Bascule optimiste : met à jour l'UI immédiatement, puis confirme avec la réponse serveur.
   * Retourne l'état final (ou lève l'erreur après avoir annulé la mise à jour).
   */
  const basculer = useCallback(async (exerciceId: number) => {
    const avant = etat.ids.has(exerciceId);
    definir(exerciceId, !avant);
    try {
      const res = await basculerFavori(exerciceId);
      definir(exerciceId, res.favori);
      return res;
    } catch (err) {
      definir(exerciceId, avant);
      throw err;
    }
  }, []);

  return { estEleve, estFavori, basculer, pret: courant.charge };
}
