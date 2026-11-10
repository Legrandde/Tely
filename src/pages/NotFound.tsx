import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden font-sans">
      {/* Bouton retour en haut à gauche */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 text-gray-900 hover:text-amber-600 transition-colors cursor-pointer inline-flex items-center"
          title="Page précédente"
        >
          <ArrowLeft size={28} strokeWidth={2.2} />
        </button>
      </div>

      {/* Contenu central */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto w-full">
        {/* 404 Header */}
        <h1 className="text-6xl sm:text-7xl font-bold text-gray-800 tracking-tight mb-2">
          404
        </h1>

        {/* Scene Illustration SVG */}
        <div className="w-full max-w-lg h-56 sm:h-64 relative flex items-center justify-center my-2">
          <svg
            viewBox="0 0 600 300"
            className="w-full h-full drop-shadow-xs"
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

        {/* Message Titre et Sous-titre */}
        <div className="space-y-1.5 mt-2">
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Look like you're lost
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-sans">
            the page you are looking for not avaible!
          </p>
        </div>

        {/* Bouton vert Go to Home */}
        <div className="mt-5">
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-[#39ac31] hover:bg-[#2f9227] text-white text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer"
          >
            Go to Home
          </Link>
        </div>
      </div>

      {/* Bouton bas à gauche : Visiter le site */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 shadow-xs transition-all cursor-pointer"
        >
          <ArrowUpRight size={17} strokeWidth={2.5} className="text-gray-900" />
          Visiter le site
        </Link>
      </div>
    </div>
  );
}
