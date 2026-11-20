import SectionTitre from "./SectionTitre";
import type { QuestionFaq } from "./faqData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqSectionProps {
  questions: QuestionFaq[];
}

/** FAQ en accordéon accessible construite avec shadcn/ui Accordion (Radix UI). */
export default function FaqSection({ questions }: FaqSectionProps) {
  return (
    <section id="faq" aria-labelledby="faq-titre" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionTitre
          id="faq-titre"
          surtitre="FAQ"
          titre="Questions fréquentes"
          sousTitre="Tout ce qu'il faut savoir avant de commencer."
        />

        <Accordion
          type="single"
          collapsible
          defaultValue={questions[0]?.question}
          className="mt-10 space-y-3"
        >
          {questions.map((q) => (
            <AccordionItem key={q.question} value={q.question}>
              <AccordionTrigger>{q.question}</AccordionTrigger>
              <AccordionContent>{q.reponse}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
