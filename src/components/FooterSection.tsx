import { Globe, Mail, Phone } from "lucide-react";

const columns = [
  { title: "Entreprise", links: ["À propos de nous", "Services", "Communauté", "Témoignages"] },
  { title: "Support", links: ["Centre d'aide", "Nous écrire", "Webinaires", "Commentaires"] },
  { title: "Liens", links: ["Exercices", "Sujets d'examen", "Corrigés"] },
];

export default function FooterSection() {
  return (
    <footer className="w-full bg-amber-50 px-4 pb-8 pt-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 md:grid-cols-5">
        {/* branding */}
        <div className="sm:col-span-2">
          <h3 className="text-xl font-extrabold text-amber-500 sm:text-2xl">Tely Elearning.</h3>
          <p className="mt-3 max-w-xs font-semibold text-black/70">
            Une bibliothèque d'exercices, d'anciens sujets et de corrigés pour réviser et réussir vos examens.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
              <Globe size={16} className="text-black" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
              <Mail size={16} className="text-black" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
              <Phone size={16} className="text-black" />
            </a>
          </div>
        </div>

        {/* colonnes de liens */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-bold text-black">{col.title}</h4>
            <ul className="mt-3 flex flex-col gap-2 text-start text-black/70">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="transition-colors hover:text-amber-500">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* contact */}
        <div>
          <h4 className="font-bold text-black">Contactez-nous</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-black/70">
            <li>+221 77 123 45 67</li>
            <li>contact@tely.com</li>
          </ul>
        </div>
      </div>

      {/* copyright */}
      <p className="mt-12 border-t border-black/10 px-2 pt-6 text-center text-sm text-black/60">
        Copyright © 2026 Tely Elearning. Tous droits réservés.
      </p>
    </footer>
  );
}
