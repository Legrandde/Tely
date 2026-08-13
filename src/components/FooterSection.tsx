import { Globe, Mail, Phone } from "lucide-react";

const columns = [
  { title: "Company", links: ["A propos de nous", "Services", "Community", "Testimonials"] },
  { title: "Support", links: ["Help Center", "Tweet @ Us", "Webinars", "Feedback"] },
  { title: "Links", links: ["exercices", "Devenir Formateur", "Service"] },
];

export default function FooterSection() {
  return (
    <footer className="relative w-full -mt-12 rounded-tl-[50px] bg-amber-50 px-4 pb-8 pt-12 sm:-mt-24 sm:rounded-tl-[100px] sm:px-6 sm:pt-20">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 md:grid-cols-5">
        {/* branding */}
        <div className="sm:col-span-2">
          <h3 className="text-xl font-extrabold text-amber-500 sm:text-2xl">Tely Elearning.</h3>
          <p className="mt-3 max-w-xs font-bold text-black/80">
            Explore a transformative approach to skill development on our online learning
            platform.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Globe size={16} className="text-black" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Mail size={16} className="text-black" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Phone size={16} className="text-black" />
            </a>
          </div>
        </div>

        {/* colonnes de liens */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-bold text-black">{col.title}</h4>
            <ul className="mt-3 flex flex-col gap-2 text-start text-black/80">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* contact */}
        <div>
          <h4 className="font-bold text-black">Contact Us</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-black/80">
            <li>+1 (555) 123-4567</li>
            <li>etechinfo@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* copyright */}
      <p className="mt-12 px-2 text-center text-sm text-black/70 sm:text-xl">
        Copyright © 2023 Tely Elearning. Tous droits réservés
      </p>
    </footer>
  );
}