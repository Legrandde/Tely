import { useEffect, useState } from "react";
import { getExercices } from "../services/exerciceService";
import type { Exercice, ExerciceFilters } from "../types/exercice";

export function useExercices(filters: ExerciceFilters = {}) {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getExercices(filters)
      .then((result) => {
        if (!cancelled) {
          setExercices(result.data);
          setTotalPages(result.last_page);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de charger les exercices";
          setError(errorMsg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { exercices, totalPages, loading, error };
}