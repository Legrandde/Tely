import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, Rss } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useSite, useSiteNom } from "../../context/SiteContext";
import { openCookiePreferences } from "../site/consent";
import type { LienNavigation } from "../../types/site";
import { URL_RSS } from "../../services/blogService";

const LEGAL_FIXES: LienNavigation[] = [
  { titre: "Mentions légales", slug: "mentions-legales" },
  { titre: "Conditions d'utilisation", slug: "cgu" },
  { titre: "Confidentialité", slug: "confidentialite" },
];

const RESSOURCES_PAR_DEFAUT: LienNavigation[] = [
  { titre: "À propos", slug: "a-propos" },
  { titre: "Contact", slug: "contact" },
];

const RESEAUX: { cle: string; label: string; Icone: IconType }[] = [
  { cle: "reseau_facebook", label: "Facebook", Icone: FaFacebookF },
  { cle: "reseau_instagram", label: "Instagram", Icone: FaInstagram },
  { cle: "reseau_linkedin", label: "LinkedIn", Icone: FaLinkedinIn },
  { cle: "reseau_youtube", label: "YouTube", Icone: FaYoutube },
  { cle: "reseau_tiktok", label: "TikTok", Icone: FaTiktok },
  { cle: "reseau_whatsapp", label: "WhatsApp", Icone: FaWhatsapp },
];

/** URL de réseau social : http(s) uniquement ; un numéro WhatsApp devient un lien wa.me. */
function urlReseau(cle: string, valeur: string | undefined): string | null {
  const v = (valeur ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (cle === "reseau_whatsapp") {
    const chiffres = v.replace(/[^\d]/g, "");
    return chiffres.length >= 8 ? `https://wa.me/${chiffres}` : null;
  }
  return null;
}

function dedoublonner(liens: LienNavigation[]): LienNavigation[] {
  const vus = new Set<string>();
  return liens.filter((l) => (vus.has(l.slug) ? false : (vus.add(l.slug), true)));
}

const lienClasse =
  "rounded text-sm text-gray-400 transition-colors hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-amber-500";

/** Footer du site public. */
export default function Footer() {
  const { parametres, navigation } = useSite();
  const siteNom = useSiteNom();
  const inscriptionsOuvertes = parametres?.inscriptions_ouvertes !== "0";
  const candidaturesOuvertes = parametres?.candidatures_ouvertes !== "0";

  const email = parametres?.contact_email?.trim();
  const telephone = parametres?.contact_telephone?.trim();
  const reseaux = RESEAUX.map((r) => ({ ...r, url: urlReseau(r.cle, parametres?.[r.cle]) })).filter(
    (r): r is typeof r & { url: string } => !!r.url
  );

  const ressources = navigation.menu.length > 0 ? navigation.menu : RESSOURCES_PAR_DEFAUT;
  const legal = dedoublonner([...navigation.footer, ...LEGAL_FIXES]).filter(
    (l) => !ressources.some((r) => r.slug === l.slug)
  );

  const description =
    parametres?.site_description?.trim() ||
    "Exercices corrigés, anciens sujets d'examen et corrections détaillées pour réviser à votre rythme et réussir vos examens.";

  return (
    <footer className="relative overflow-hidden bg-gray-900 pb-8 pt-16 text-gray-300">
      <div
        className="absolute left-1/2 top-0 h-px w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-gray-800 pb-12 md:grid-cols-12">
          {/* Marque */}
          <div className="col-span-2 space-y-4 md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 font-black text-gray-950"
                aria-hidden="true"
              >
                {siteNom.charAt(0).toUpperCase()}
              </span>
              <span>
                {siteNom}
                <span className="text-amber-400">.</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">{description}</p>

            {(email || telephone) && (
              <ul className="space-y-2 text-sm">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={`${lienClasse} inline-flex items-center gap-2`}>
                      <Mail size={15} className="text-amber-500" aria-hidden="true" />
                      {email}
                    </a>
                  </li>
                )}
                {telephone && (
                  <li>
                    <a
                      href={`tel:${telephone.replace(/[^\d+]/g, "")}`}
                      className={`${lienClasse} inline-flex items-center gap-2`}
                    >
                      <Phone size={15} className="text-amber-500" aria-hidden="true" />
                      {telephone}
                    </a>
                  </li>
                )}
              </ul>
            )}

            {reseaux.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Réseaux sociaux">
                {reseaux.map(({ cle, label, Icone, url }) => (
                  <li key={cle}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${siteNom} sur ${label}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-amber-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-amber-500"
                    >
                      <Icone size={15} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Plateforme */}
          <nav aria-labelledby="footer-plateforme" className="md:col-span-2">
            <h2 id="footer-plateforme" className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Plateforme
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link to="/exercices" className={lienClasse}>
                  Exercices
                </Link>
              </li>
              <li>
                <Link to="/sujets" className={lienClasse}>
                  Sujets d'examen
                </Link>
              </li>
              <li>
                <Link to="/exercices?avec_correction=true" className={lienClasse}>
                  Exercices corrigés
                </Link>
              </li>
              {candidaturesOuvertes && (
                <li>
                  <Link to="/#enseignants" className={lienClasse}>
                    Devenir enseignant
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Ressources */}
          <nav aria-labelledby="footer-ressources" className="md:col-span-2">
            <h2 id="footer-ressources" className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Ressources
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link to="/blog" className={lienClasse}>
                  Blog
                </Link>
              </li>
              {ressources.map((p) => (
                <li key={p.slug}>
                  <Link to={`/p/${p.slug}`} className={lienClasse}>
                    {p.titre}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/#faq" className={lienClasse}>
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <a href={URL_RSS} target="_blank" rel="noopener noreferrer" className={`${lienClasse} inline-flex items-center gap-1.5`}>
                  <Rss size={13} className="text-amber-500" aria-hidden="true" />
                  Flux RSS du blog
                </a>
              </li>
            </ul>
          </nav>

          {/* Légal */}
          <nav aria-labelledby="footer-legal" className="md:col-span-2">
            <h2 id="footer-legal" className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Légal
            </h2>
            <ul className="space-y-2.5">
              {legal.map((p) => (
                <li key={p.slug}>
                  <Link to={`/p/${p.slug}`} className={lienClasse}>
                    {p.titre}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openCookiePreferences} className={`${lienClasse} text-left`}>
                  Gérer les cookies
                </button>
              </li>
            </ul>
          </nav>

          {/* Appel à l'action */}
          <div className="col-span-2 space-y-3 md:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Prêt à progresser ?</h2>
            <p className="text-sm text-gray-400">
              {inscriptionsOuvertes
                ? "Créez votre compte gratuit et commencez à réviser dès aujourd'hui."
                : "Parcourez nos exercices et sujets d'examen dès maintenant."}
            </p>
            <Link
              to={inscriptionsOuvertes ? "/auth/signup" : "/exercices"}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-md shadow-amber-500/20 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              {inscriptionsOuvertes ? "Créer un compte gratuit" : "Explorer les exercices"}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteNom}. Tous droits réservés.
          </p>
          <p>Fait avec soin pour les élèves et les enseignants.</p>
        </div>
      </div>
    </footer>
  );
}
