import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, Filter, UserPlus } from "lucide-react";
import SectionTitre from "./SectionTitre";
import { useCtaInscription } from "./useCtaInscription";
import { useAuth } from "../../context/authContext";

/** « Comment ça marche » en 3 étapes. */
export default function HowItWorks() {
  const cta = useCtaInscription("Créer mon compte gratuit");
  const { isAuthenticated } = useAuth();

  const etapes = [
    {
      Icone: UserPlus,
      titre: cta.inscriptionsOuvertes ? "Créez votre compte gratuit" : "Accédez à la plateforme",
      texte: cta.inscriptionsOuvertes
        ? "Inscription en quelques secondes avec votre e-mail ou votre compte Google."
        : "Parcourez librement le catalogue d'exercices et de sujets d'examen.",
    },
    {
      Icone: Filter,
      titre: "Choisissez matière et niveau",
      texte: "Filtrez par matière, classe, série ou difficulté pour trouver exactement ce qu'il vous faut.",
    },
    {
      Icone: BookOpenCheck,
      titre: "Entraînez-vous et corrigez-vous",
      texte: "Faites l'exercice, puis comparez avec le corrigé détaillé pour comprendre vos erreurs.",
    },
  ];

  return (
    <section aria-labelledby="etapes-titre" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitre
          id="etapes-titre"
          surtitre="Comment ça marche"
          titre="Trois étapes pour réviser efficacement"
          sousTitre="Pas de manuel compliqué : vous trouvez un exercice, vous le faites, vous comprenez."
        />

        <div className="relative mt-12">
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-amber-300 md:block"
            aria-hidden="true"
          />
          <ol className="relative grid gap-6 md:grid-cols-3">
          {etapes.map(({ Icone, titre, texte }, i) => (
            <motion.li
              key={titre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg shadow-amber-900/5"
            >
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-amber-400 shadow-lg">
                <Icone size={26} aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-extrabold text-gray-900 ring-4 ring-amber-50">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-5 text-lg font-bold text-gray-900">{titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{texte}</p>
            </motion.li>
          ))}
          </ol>
        </div>

        {!isAuthenticated && (
          <div className="mt-10 flex justify-center">
            <Link to={cta.to} className="tely-btn">
              {cta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
