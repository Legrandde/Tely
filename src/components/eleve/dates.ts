/** Utilitaires de dates pour l'espace élève (affichage en français). */

function cleJour(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** « Aujourd'hui », « Hier » ou « lundi 3 novembre » (+ année si différente). */
export function libelleGroupeJour(dateIso: string, maintenant = new Date()): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "Date inconnue";
  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  if (cleJour(d) === cleJour(maintenant)) return "Aujourd'hui";
  if (cleJour(d) === cleJour(hier)) return "Hier";
  const libelle = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== maintenant.getFullYear() ? { year: "numeric" } : {}),
  });
  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

/** Clé de regroupement par jour local. */
export function cleGroupeJour(dateIso: string): string {
  const d = new Date(dateIso);
  return Number.isNaN(d.getTime()) ? "inconnue" : cleJour(d);
}

/** « à l'instant », « il y a 5 min », « il y a 3 h », « hier », « il y a 4 j », sinon la date. */
export function tempsRelatif(dateIso: string, maintenant = new Date()): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";
  const secondes = Math.round((maintenant.getTime() - d.getTime()) / 1000);
  if (secondes < 60) return "à l'instant";
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24 && cleJour(d) === cleJour(maintenant)) return `il y a ${heures} h`;
  const libelle = libelleGroupeJour(dateIso, maintenant);
  if (libelle === "Hier") return "hier";
  const jours = Math.round(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function heure(dateIso: string): string {
  const d = new Date(dateIso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
