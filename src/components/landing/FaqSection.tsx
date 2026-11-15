import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionTitre from "./SectionTitre";
import type { QuestionFaq } from "./faqData";

interface FaqSectionProps {
  questions: QuestionFaq[];
}

/** FAQ en accordéon accessible (boutons aria-expanded / régions liées). */
export default function FaqSection({ questions }: FaqSectionProps) {
  const [ouverte, setOuverte] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-titre" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionTitre
          id="faq-titre"
          surtitre="FAQ"
          titre="Questions fréquentes"
          sousTitre="Tout ce qu'il faut savoir avant de commencer."
        />

        <div className="mt-10 divide-y divide-amber-200/70 rounded-2xl bg-white px-2 shadow-lg shadow-amber-900/5 sm:px-4">
          {questions.map((q, i) => {
            const estOuverte = ouverte === i;
            const boutonId = `${base}-q-${i}`;
            const panneauId = `${base}-r-${i}`;
            return (
              <div key={q.question}>
                <h3>
                  <button
                    id={boutonId}
                    type="button"
                    aria-expanded={estOuverte}
                    aria-controls={panneauId}
                    onClick={() => setOuverte(estOuverte ? null : i)}
                    className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-5 text-left text-base font-semibold text-gray-900 transition-colors hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-500"
                  >
                    {q.question}
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 text-amber-600 transition-transform duration-200 motion-reduce:transition-none ${
                        estOuverte ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panneauId}
                  role="region"
                  aria-labelledby={boutonId}
                  hidden={!estOuverte}
                  className="px-3 pb-5 text-sm leading-relaxed text-gray-600 sm:text-base"
                >
                  {q.reponse}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
