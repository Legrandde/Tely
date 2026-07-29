import { useEffect, useState } from "react";
import { getMatieres, getNiveaux } from "../services/exerciceService";
import type { Matiere, Niveau } from "../types/exercice";

export function useReferenceData() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, n] = await Promise.all([getMatieres(), getNiveaux()]);
        setMatieres(m);
        setNiveaux(n);
      } catch {
        // silencieux, le FilterPanel affichera juste des listes vides
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { matieres, niveaux, loading };
}