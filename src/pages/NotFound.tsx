import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Home } from "lucide-react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { useSeo } from "../hooks/useSeo";

const SUGGESTIONS = [
  { to: "/exercices", label: "Exercices corrigés", Icone: BookOpen },
  { to: "/sujets", label: "Sujets d'examen", Icone: FileText },
  { to: "/", label: "Page d'accueil", Icone: Home },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  useSeo({
    title: "Page introuvable",
    description: "La page demandée n'existe pas ou a été déplacée.",
    noindex: true,
  });

  return (
    <div className="tely-page flex min-h-screen flex-col">
      <Header />

      <main id="contenu" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-6xl font-extrabold tracking-tight text-amber-500 sm:text-7xl">404</p>

        <div className="relative my-2 flex h-56 w-full max-w-lg items-center justify-center sm:h-64">
          <svg
            viewBox="0 0 600 300"
            className="h-full w-full"
            aria-hidden="true"
            focusable="false"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft background ground arc */}
            <path
              d="M30 250 Q300 235 570 250"
              stroke="#f1f5f9"
              strokeWidth="3"
              strokeDasharray="6 6"
            />

            {/* Left green bushes */}
            <g fill="#22c55e">
              <ellipse cx="170" cy="245" rx="35" ry="18" />
              <ellipse cx="195" cy="248" rx="28" ry="14" />
              <ellipse cx="230" cy="250" rx="20" ry="10" />
            </g>

            {/* Right green bushes */}
            <g fill="#22c55e">
              <ellipse cx="370" cy="250" rx="22" ry="11" />
              <ellipse cx="400" cy="246" rx="30" ry="16" />
              <ellipse cx="460" cy="252" rx="20" ry="10" />
            </g>

            {/* Left Stone Structure (Inuksuk / Dolmen) */}
            <g fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5">
              {/* Base stone */}
              <path d="M175 250 C175 200 185 180 195 180 C205 180 215 200 215 250 Z" />
              {/* Horizontal slab */}
              <ellipse cx="195" cy="180" rx="32" ry="14" />
              {/* Top stone */}
              <ellipse cx="192" cy="145" rx="14" ry="19" />
            </g>

            {/* Right Standing Megalith Stone */}
            <g fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2">
              <path d="M420 250 C410 180 425 105 450 105 C475 105 490 180 480 250 Z" />
              {/* Stone shadow curve */}
              <path
                d="M445 120 C465 150 460 210 472 245"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                fill="none"
              />
            </g>

            {/* Caveman */}
            <g id="caveman">
              {/* Legs */}
              <rect x="288" y="215" width="10" height="38" rx="5" fill="#fbcfe8" />
              <rect x="302" y="215" width="10" height="38" rx="5" fill="#fbcfe8" />
              {/* Feet */}
              <ellipse cx="291" cy="252" rx="7" ry="4" fill="#fbcfe8" />
              <ellipse cx="309" cy="252" rx="7" ry="4" fill="#fbcfe8" />

              {/* Arms */}
              <path
                d="M272 170 Q262 195 275 208"
                stroke="#fbcfe8"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M328 170 Q338 195 325 208"
                stroke="#fbcfe8"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />

              {/* Tunic / Dress (Leopard spots) */}
              <path
                d="M276 172 L266 220 L334 220 L324 172 Z"
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth="1"
              />
              {/* Leopard spots on tunic */}
              <circle cx="282" cy="190" r="2.5" fill="#78350f" />
              <circle cx="295" cy="182" r="3" fill="#78350f" />
              <circle cx="316" cy="185" r="2.5" fill="#78350f" />
              <circle cx="304" cy="198" r="3" fill="#78350f" />
              <circle cx="280" cy="210" r="3" fill="#78350f" />
              <circle cx="295" cy="212" r="2.5" fill="#78350f" />
              <circle cx="320" cy="208" r="3" fill="#78350f" />

              {/* Head / Face */}
              <circle cx="300" cy="140" r="22" fill="#fbcfe8" />

              {/* Hair */}
              <path
                d="M278 140 C276 115 324 115 322 140 C322 130 315 124 300 124 C285 124 278 130 278 140 Z"
                fill="#451a03"
              />
              {/* Bangs */}
              <polygon points="285,127 290,135 295,127 300,136 305,127 312,135 315,127" fill="#451a03" />

              {/* Eyebrows */}
              <line x1="289" y1="135" x2="297" y2="136" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="303" y1="136" x2="311" y2="135" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />

              {/* Eyes */}
              <circle cx="293" cy="140" r="1.8" fill="#1e293b" />
              <circle cx="307" cy="140" r="1.8" fill="#1e293b" />

              {/* Nose */}
              <ellipse cx="300" cy="143" rx="3.5" ry="2.5" fill="#f472b6" />

              {/* Big Beard */}
              <path
                d="M278 144 C278 174 322 174 322 144 C314 150 286 150 278 144 Z"
                fill="#451a03"
              />

              {/* Mouth biting the cord */}
              <ellipse cx="300" cy="149" rx="3.5" ry="3" fill="#1e293b" />
            </g>

            {/* Thick Black Cable from mouth to disconnected ground */}
            <path
              d="M215 250 Q260 252 284 210 Q298 175 300 150 Q305 185 315 220 Q335 252 380 250"
              stroke="#1e293b"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cut wire ends */}
            <circle cx="214" cy="250" r="3" fill="#0f172a" />
            <circle cx="381" cy="250" r="3" fill="#0f172a" />
          </svg>
        </div>

        <h1 className="tely-title text-2xl sm:text-3xl">Oups, cette page est introuvable</h1>
        <p className="mt-2 max-w-md text-sm text-gray-500 sm:text-base">
          Le lien est peut-être erroné ou la page a été déplacée. Voici quelques pistes pour reprendre vos révisions.
        </p>

        <ul className="mt-8 grid w-full gap-3 sm:grid-cols-3">
          {SUGGESTIONS.map(({ to, label, Icone }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex h-full items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <Icone size={16} className="text-amber-600" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Revenir à la page précédente
        </button>
      </main>

      <Footer />
    </div>
  );
}
