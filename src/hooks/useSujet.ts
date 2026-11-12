import { useEffect, useState } from "react";
import api from "../api/axio";
import type { SujetInterface } from "../types/Sujet";

export type { SujetInterface };

export default function UseSujet() {
  const [sujet, setSujet] = useState<SujetInterface[]>([]);
  const [loadingSujet, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<SujetInterface[] | { data: SujetInterface[] }>("/api/sujets")
      .then((response) => {
        if (!cancelled) {
          const raw = response.data;
          const list = Array.isArray(raw) ? raw : (raw as { data: SujetInterface[] }).data || [];
          setSujet(list);
          setErr(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = (e as { message?: string })?.message ?? "Erreur lors du chargement des sujets";
          setErr(msg);
          setSujet([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { sujet, loadingSujet, err };
}
