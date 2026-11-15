import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/SidebarContext";
import { resolveImageUrl } from "../../utils/imageUrl";
import NotificationDropdown from "../notifications/NotificationDropdown";

const TITRES: Array<[string, string]> = [
  ["/espace/favoris", "Mes favoris"],
  ["/espace/historique", "Historique"],
  ["/espace/compte", "Mon compte"],
  ["/espace", "Tableau de bord"],
];

export default function HeaderEleve() {
  const { user } = useAuth();
  const { toggleMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState("");

  const chemin = location.pathname.toLowerCase();
  const titre = TITRES.find(([p]) => chemin.startsWith(p))?.[1] ?? "Mon espace";

  const nomComplet = `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim();
  const initiales =
    nomComplet
      .split(" ")
      .filter(Boolean)
      .map((m) => m.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "?";
  const avatar = resolveImageUrl(user?.avatar_url || user?.avatar);

  function rechercher(e: React.FormEvent) {
    e.preventDefault();
    const q = recherche.trim();
    // La page /exercices lit ses filtres en interne : on y renvoie l'élève, la recherche
    // est transmise en paramètre d'URL pour une éventuelle prise en charge.
    navigate(q ? `/exercices?q=${encodeURIComponent(q)}` : "/exercices");
  }

  return (
    <header className="flex items-center h-16 justify-between gap-3 px-3 sm:px-6 tely-page w-full shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden tely-icon-btn shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <p className="tely-title text-lg sm:text-xl truncate">{titre}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <form
          role="search"
          onSubmit={rechercher}
          className="hidden md:flex items-center gap-2 bg-white rounded-[10px] px-3 py-2.5 w-52 lg:w-72 border border-gray-200 transition-all focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]"
        >
          <Search size={15} className="text-gray-900 shrink-0" aria-hidden="true" />
          <label htmlFor="recherche-eleve" className="sr-only">
            Rechercher un exercice
          </label>
          <input
            id="recherche-eleve"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un exercice..."
            className="bg-transparent text-sm text-gray-900 outline-none w-full placeholder:text-gray-400"
          />
        </form>

        <NotificationDropdown />

        <Link
          to="/espace/compte"
          className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white hover:ring-gray-900 focus-visible:ring-gray-900 shrink-0 transition-all"
          aria-label={`Mon compte (${nomComplet || "élève"})`}
        >
          {avatar ? (
            <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
              {initiales}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
