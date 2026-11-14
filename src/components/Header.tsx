import { Search, Settings, Menu } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../utils/imageUrl";
import { useSidebar } from "../context/SidebarContext";
import NotificationDropdown from "./notifications/NotificationDropdown";

const TITLES: Record<string, string> = {
  statistiques: "Statistiques & Audience",
  candidatures: "Candidatures Enseignants",
  utilisateurs: "Comptes & rôles",
  parametres: "Paramètres & Compte",
  profile: "Paramètres & Compte",
  notifications: "Paramètres & Compte",
  exercices: "Gestion des exercices",
  sujets: "Gestion des sujets d'examen",
  corrections: "Gestion des corrections",
  eleves: "Gestion des élèves",
  professeurs: "Gestion des professeurs",
  matieres: "Gestion des matières",
  niveaux: "Gestion des niveaux",
  categories: "Gestion des catégories",
  ressources: "Documents & Ressources PDF",
  overview: "Tableau de bord",
};

export default function Header({ title }: { title?: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname.toLowerCase();
    for (const [key, value] of Object.entries(TITLES)) {
      if (path.includes(`/${key}`)) {
        return value;
      }
    }
    return "Tableau de bord";
  };

  const nomComplet = user
    ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
    : "";
  const initiales = nomComplet
    ? nomComplet
    .split(" ")
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
    : "?";

  const profilePath =
    user?.role === "administrateur"
      ? "/Dashbord-admin/profile"
      : user?.role === "professeur"
      ? "/Dashboard-professeur/profile"
      : "/profile";

  const settingsPath =
    user?.role === "administrateur"
      ? "/Dashbord-admin/parametres"
      : user?.role === "professeur"
      ? "/Dashboard-professeur/parametres"
      : "/parametres";

  const avatarUrl = resolveImageUrl(user?.avatar_url || user?.avatar);
  const { toggleMobile } = useSidebar();

  return (
    <div className="flex items-center h-16 justify-between px-3 sm:px-6 tely-page w-full shrink-0">
      {/* Bouton Hamburger mobile + Titre page */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden tely-icon-btn shrink-0"
          aria-label="Ouvrir le menu latéral"
          title="Menu de navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="tely-title text-lg sm:text-xl truncate">{getPageTitle()}</h1>
      </div>

      {/* Droite : search + icons + avatar */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-white rounded-[10px] px-3 py-2.5 w-48 lg:w-64 border border-gray-200 transition-all duration-200 focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]">
          <Search size={15} className="text-gray-900 shrink-0" />
          <input
            type="text"
            placeholder="Recherche globale..."
            className="bg-transparent text-sm text-gray-900 outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Settings -> Paramètres */}
        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          title="Paramètres & Configuration"
          className="tely-icon-btn hover:bg-white"
        >
          <Settings size={18} />
        </button>

        {/* Bell avec dropdown interactif & temps réel */}
        <NotificationDropdown />

        {/* Avatar cliquable */}
        <button
          type="button"
          onClick={() => navigate(profilePath)}
          className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-white hover:ring-gray-900 shrink-0 transition-all"
          title={`Profil de ${nomComplet || "l'utilisateur"}`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nomComplet || "avatar"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
              {initiales}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
