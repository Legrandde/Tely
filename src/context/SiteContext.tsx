import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getNavigationSite,
  getParametresPublics,
  getStatsPubliques,
} from "../services/siteService";
import type {
  NavigationSite,
  ParametresPublics,
  SiteContextValue,
  StatsPubliques,
} from "../types/site";

const CACHE_KEY = "tely:site-cache";
const NAVIGATION_VIDE: NavigationSite = { menu: [], footer: [] };

interface SiteCache {
  parametres: ParametresPublics | null;
  navigation: NavigationSite;
  stats: StatsPubliques | null;
}

/** Lecture du cache local : affichage instantané au prochain chargement (annonce, menu, maintenance). */
function lireCache(): SiteCache | null {
  try {
    const brut = localStorage.getItem(CACHE_KEY);
    if (!brut) return null;
    const cache = JSON.parse(brut) as Partial<SiteCache>;
    return {
      parametres: cache.parametres ?? null,
      navigation: {
        menu: Array.isArray(cache.navigation?.menu) ? cache.navigation.menu : [],
        footer: Array.isArray(cache.navigation?.footer) ? cache.navigation.footer : [],
      },
      stats: cache.stats ?? null,
    };
  } catch {
    return null;
  }
}

function ecrireCache(cache: SiteCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // stockage indisponible (navigation privée, quota) : on ignore
  }
}

const VALEUR_PAR_DEFAUT: SiteContextValue = {
  parametres: null,
  navigation: NAVIGATION_VIDE,
  stats: null,
  loading: false,
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<SiteCache>(
    () => lireCache() ?? { parametres: null, navigation: NAVIGATION_VIDE, stats: null }
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let annule = false;

    Promise.allSettled([getParametresPublics(), getNavigationSite(), getStatsPubliques()]).then(
      ([parametres, navigation, stats]) => {
        if (annule) return;
        setEtat((precedent) => {
          const suivant: SiteCache = {
            parametres: parametres.status === "fulfilled" ? parametres.value : precedent.parametres,
            navigation: navigation.status === "fulfilled" ? navigation.value : precedent.navigation,
            stats: stats.status === "fulfilled" ? stats.value : precedent.stats,
          };
          ecrireCache(suivant);
          return suivant;
        });
        setLoading(false);
      }
    );

    return () => {
      annule = true;
    };
  }, []);

  const valeur = useMemo<SiteContextValue>(
    () => ({ ...etat, loading }),
    [etat, loading]
  );

  return <SiteContext.Provider value={valeur}>{children}</SiteContext.Provider>;
}

/** Données publiques du site. Hors `SiteProvider`, renvoie des valeurs vides (jamais d'exception). */
// eslint-disable-next-line react-refresh/only-export-components
export function useSite(): SiteContextValue {
  return useContext(SiteContext) ?? VALEUR_PAR_DEFAUT;
}

/** Nom du site avec repli. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSiteNom(): string {
  const { parametres } = useSite();
  return parametres?.site_nom?.trim() || "Tely";
}
