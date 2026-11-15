import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { BlocRenduProps, FaqItem } from "../types";
import { liste, txt } from "../utils/props";
import Markdown from "./Markdown";
import { EnteteSection, Reveal, Section } from "./shared";

function Question({ question, reponse, base, index }: { question: string; reponse: string; base: string; index: number }) {
  const [ouvert, setOuvert] = useState(index === 0);
  const reduire = useReducedMotion();
  const idBouton = `${base}-q-${index}`;
  const idPanneau = `${base}-r-${index}`;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <h3>
        <button
          type="button"
          id={idBouton}
          aria-expanded={ouvert}
          aria-controls={idPanneau}
          onClick={() => setOuvert((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-gray-900 transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg @3xl:text-lg"
        >
          <span>{question}</span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              ouvert ? "rotate-45 bg-gray-900 text-white" : "bg-amber-100 text-amber-800"
            }`}
          >
            <Plus size={16} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {ouvert && (
          <motion.div
            id={idPanneau}
            role="region"
            aria-labelledby={idBouton}
            initial={reduire ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduire ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduire ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Markdown texte={reponse} className="pb-6 pr-12 text-[15px] leading-relaxed text-gray-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqBloc({ props }: BlocRenduProps<"faq">) {
  const base = useId();
  const titre = txt(props.titre);
  const elements = liste<FaqItem>(props.elements)
    .map((e) => ({ question: txt(e.question), reponse: txt(e.reponse) }))
    .filter((e) => e.question);
  if (!titre && elements.length === 0) return null;

  return (
    <Section fond="creme" etroit>
      <EnteteSection titre={titre} />
      {elements.length > 0 && (
        <Reveal className="rounded-2xl bg-white px-5 shadow-sm ring-1 ring-gray-900/5 @3xl:px-8">
          {elements.map((e, i) => (
            <Question key={i} index={i} base={base} question={e.question} reponse={e.reponse} />
          ))}
        </Reveal>
      )}
    </Section>
  );
}
