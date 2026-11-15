import { BadgeCheck, GraduationCap, Smartphone, Wallet } from "lucide-react";

const ITEMS = [
  { Icone: Wallet, titre: "Gratuit pour les élèves", texte: "Aucune carte bancaire" },
  { Icone: BadgeCheck, titre: "Contenus vérifiés", texte: "Par des enseignants validés" },
  { Icone: GraduationCap, titre: "Classés par niveau", texte: "Du collège au BAC" },
  { Icone: Smartphone, titre: "Sur tous vos écrans", texte: "Téléphone, tablette, PC" },
];

/** Bandeau de réassurance sous le hero. */
export default function ReassuranceBand() {
  return (
    <section aria-label="Pourquoi nous faire confiance" className="border-y border-amber-200/60 bg-white/70">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
        {ITEMS.map(({ Icone, titre, texte }) => (
          <li key={titre} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Icone size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900">{titre}</span>
              <span className="block text-xs text-gray-500">{texte}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
