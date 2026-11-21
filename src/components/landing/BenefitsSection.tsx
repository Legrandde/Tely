import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Award,
  BookMarked,
  BookOpen,
  Calculator,
  ClipboardCheck,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutGrid,
  Leaf,
  PenTool,
  RotateCcw,
  School,
  TrendingUp,
  Trophy,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OptionQuestion {
  id: string;
  label: string;
  Icone: LucideIcon;
}

interface EtapeGuide {
  id: "objectif" | "niveau" | "matiere";
  question: string;
  options: OptionQuestion[];
}

const ETAPES: EtapeGuide[] = [
  {
    id: "objectif",
    question: "Quel est votre objectif principal ?",
    options: [
      { id: "bac", label: "Préparer le BAC", Icone: GraduationCap },
      { id: "bepc", label: "Réussir le BEPC", Icone: Award },
      { id: "progresser", label: "Progresser en classe", Icone: TrendingUp },
      { id: "comprendre", label: "Comprendre un cours", Icone: BookOpen },
      { id: "sujets", label: "Anciens sujets", Icone: FileText },
      { id: "autre", label: "Autre objectif", Icone: HelpCircle },
    ],
  },
  {
    id: "niveau",
    question: "Quel est votre niveau actuel ?",
    options: [
      { id: "college", label: "Collège (7e – 9e)", Icone: School },
      { id: "10e", label: "10e année (BEPC)", Icone: ClipboardCheck },
      { id: "11e", label: "11e année (Lycée)", Icone: BookMarked },
      { id: "12e", label: "12e année (Lycée)", Icone: Layers },
      { id: "terminale", label: "Terminale (BAC)", Icone: Trophy },
      { id: "libre", label: "Candidat libre", Icone: UserCheck },
    ],
  },
  {
    id: "matiere",
    question: "Quelle matière réviser en priorité ?",
    options: [
      { id: "maths", label: "Mathématiques", Icone: Calculator },
      { id: "physique", label: "Physique-Chimie", Icone: Atom },
      { id: "francais", label: "Français", Icone: PenTool },
      { id: "svt", label: "Biologie / SVT", Icone: Leaf },
      { id: "histgeo", label: "Histoire-Géo", Icone: Globe },
      { id: "toutes", label: "Toutes les matières", Icone: LayoutGrid },
    ],
  },
];

/** Section « Tout pour réussir » — parcours guidé en 3 questions rapides. */
export default function BenefitsSection() {
  const [etapeIndex, setEtapeIndex] = useState(0);
  const [reponses, setReponses] = useState<Partial<Record<EtapeGuide["id"], OptionQuestion>>>({});

  const termine = etapeIndex >= ETAPES.length;
  const etapeActuelle = ETAPES[etapeIndex];

  const choisir = (option: OptionQuestion) => {
    if (!etapeActuelle) return;
    setReponses((prev) => ({ ...prev, [etapeActuelle.id]: option }));
    setEtapeIndex((prev) => prev + 1);
  };

  const retour = () => setEtapeIndex((prev) => Math.max(0, prev - 1));
  const recommencer = () => {
    setReponses({});
    setEtapeIndex(0);
  };

  const versSujets =
    reponses.objectif?.id === "bac" ||
    reponses.objectif?.id === "bepc" ||
    reponses.objectif?.id === "sujets";

  return (
    <section
      aria-labelledby="benefices-titre"
      className="bg-background px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
        {/* Colonne gauche — intro éditoriale */}
        <div>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            Tout pour réussir
          </span>

          <h2
            id="benefices-titre"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem] sm:leading-[1.12]"
          >
            Vous ne savez pas par où commencer ?
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Répondez à trois questions rapides pour accéder directement aux
            exercices corrigés et anciens sujets adaptés à votre niveau.
          </p>
        </div>

        {/* Colonne droite — carte interactive 3 questions */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs sm:p-8">
          {!termine && etapeActuelle ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="max-w-sm text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {etapeActuelle.question}
                </h3>

                {/* Indicateur de progression */}
                <div
                  className="flex items-center gap-2.5 pt-1"
                  aria-label={`Question ${etapeIndex + 1} sur ${ETAPES.length}`}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    Question {etapeIndex + 1} sur {ETAPES.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {ETAPES.map((e, idx) => (
                      <span
                        key={e.id}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          idx === etapeIndex
                            ? "w-9 bg-amber-500"
                            : idx < etapeIndex
                              ? "w-4 bg-amber-500/45"
                              : "w-4 bg-muted",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={etapeActuelle.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3"
                >
                  {etapeActuelle.options.map((opt) => {
                    const selectionne = reponses[etapeActuelle.id]?.id === opt.id;
                    const Icone = opt.Icone;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => choisir(opt)}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-150",
                          selectionne
                            ? "border-amber-500 bg-amber-500/10 text-foreground"
                            : "border-transparent bg-muted/50 text-foreground hover:border-amber-500/40 hover:bg-amber-500/5",
                        )}
                      >
                        <Icone
                          className="size-4 shrink-0 text-amber-600 transition-transform duration-150 group-hover:scale-110 dark:text-amber-400"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium leading-snug">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {etapeIndex > 0 && (
                <div className="mt-5 flex justify-start">
                  <button
                    type="button"
                    onClick={retour}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    Question précédente
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col justify-between gap-6"
            >
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Votre programme de révision est prêt
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Objectif :{" "}
                  <span className="font-medium text-foreground">
                    {reponses.objectif?.label}
                  </span>{" "}
                  · Niveau :{" "}
                  <span className="font-medium text-foreground">
                    {reponses.niveau?.label}
                  </span>{" "}
                  · Matière :{" "}
                  <span className="font-medium text-foreground">
                    {reponses.matiere?.label}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-amber-500 px-5 text-slate-950 hover:bg-amber-400"
                >
                  <Link to={versSujets ? "/sujets" : "/exercices"}>
                    {versSujets
                      ? "Explorer les sujets d'examen"
                      : "Voir les exercices corrigés"}
                    <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="rounded-full">
                  <Link to={versSujets ? "/exercices" : "/sujets"}>
                    {versSujets ? "Voir aussi les exercices" : "Voir les sujets d'examen"}
                  </Link>
                </Button>

                <button
                  type="button"
                  onClick={recommencer}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Recommencer
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
