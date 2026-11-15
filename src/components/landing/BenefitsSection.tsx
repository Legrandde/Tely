import { motion } from "framer-motion";
import { BookOpen, FileCheck2, FileText, Heart, Printer, Users } from "lucide-react";
import SectionTitre from "./SectionTitre";

const BENEFICES = [
  {
    Icone: BookOpen,
    titre: "Exercices par niveau",
    texte: "Des séries d'exercices classées par matière, classe et difficulté pour progresser pas à pas.",
  },
  {
    Icone: FileText,
    titre: "Anciens sujets d'examen",
    texte: "Brevet, BAC et compositions : entraînez-vous dans les conditions réelles de l'examen.",
  },
  {
    Icone: FileCheck2,
    titre: "Corrigés détaillés",
    texte: "Chaque étape est expliquée pour comprendre la méthode, pas seulement le résultat.",
  },
  {
    Icone: Heart,
    titre: "Favoris et historique",
    texte: "Retrouvez en un clic les exercices enregistrés et ceux que vous avez déjà consultés.",
  },
  {
    Icone: Printer,
    titre: "Impression et PDF",
    texte: "Imprimez un exercice ou enregistrez-le en PDF pour réviser hors connexion.",
  },
  {
    Icone: Users,
    titre: "Des enseignants engagés",
    texte: "Les contenus sont publiés par des enseignants dont le profil a été validé.",
  },
];

/** Bénéfices / fonctionnalités clés. */
export default function BenefitsSection() {
  return (
    <section aria-labelledby="benefices-titre" className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitre
            id="benefices-titre"
            centre={false}
            surtitre="Tout pour réussir"
            titre="Une seule plateforme pour toutes vos révisions"
            sousTitre="Fini les photocopies perdues et les corrigés introuvables : tout est rangé, à jour et accessible partout."
          />
          <div className="relative mt-8 hidden lg:block">
            <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-amber-200/60" aria-hidden="true" />
            <img
              src="/histoire.png"
              alt="Des élèves souriants qui révisent ensemble avec Tely"
              width={735}
              height={572}
              loading="lazy"
              decoding="async"
              className="relative h-auto w-full rounded-2xl border border-gray-100 object-cover shadow-xl"
            />
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {BENEFICES.map(({ Icone, titre, texte }, i) => (
            <motion.li
              key={titre}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="group rounded-2xl border border-gray-100 bg-amber-50/50 p-5 transition-colors hover:border-amber-200 hover:bg-amber-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm transition-colors group-hover:bg-amber-500 group-hover:text-gray-900">
                <Icone size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-gray-900">{titre}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{texte}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
