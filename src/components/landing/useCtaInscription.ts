import { useSite } from "../../context/SiteContext";

/**
 * CTA principal de conversion. Si les inscriptions sont fermées
 * (`inscriptions_ouvertes === "0"`), il devient « Explorer les exercices ».
 */
export function useCtaInscription(libelle = "Commencer gratuitement") {
  const { parametres } = useSite();
  const ouvert = parametres?.inscriptions_ouvertes !== "0";
  return ouvert
    ? { to: "/auth/signup", label: libelle, inscriptionsOuvertes: true }
    : { to: "/exercices", label: "Explorer les exercices", inscriptionsOuvertes: false };
}
