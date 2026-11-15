/* Petits utilitaires de formatage partagés par les écrans du back-office. */

const RTF = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto", style: "short" });

/**
 * Date relative courte : « à l'instant », « il y a 5 min », « il y a 3 j », « il y a 2 mois ».
 * Retourne null si la date est absente ou invalide.
 */
export function tempsRelatif(date: string | null | undefined, maintenant: number = Date.now()): string | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  const secondes = Math.round((t - maintenant) / 1000);
  const abs = Math.abs(secondes);
  if (abs < 45) return "à l'instant";
  if (abs < 3600) return RTF.format(Math.round(secondes / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(secondes / 3600), "hour");
  if (abs < 86400 * 30) return RTF.format(Math.round(secondes / 86400), "day");
  if (abs < 86400 * 365) return RTF.format(Math.round(secondes / (86400 * 30)), "month");
  return RTF.format(Math.round(secondes / (86400 * 365)), "year");
}

/** Date + heure complètes en français (infobulles). */
export function dateHeureComplete(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialesDe(prenom?: string | null, nom?: string | null): string {
  return `${prenom?.trim()?.[0] ?? ""}${nom?.trim()?.[0] ?? ""}`.toUpperCase() || "?";
}

/** Message d'erreur lisible depuis une erreur axios (validation Laravel, message serveur). */
export function messageErreurApi(err: unknown, defaut: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  const premiere = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
  return premiere ?? data?.message ?? defaut;
}
