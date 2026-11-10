import { Search, Settings, Bell } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../utils/imageUrl";

const TITLES: Record<string, string> = {
  statistiques: "Statistiques & Audience",
  profile: "Mon Profil Utilisateur",
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

  const avatarUrl = resolveImageUrl(user?.avatar_url || user?.avatar);

  return (
    <div className="flex items-center h-16 justify-between px-6 bg-white border-b border-gray-100 w-full shrink-0">
      {/* Titre page */}
      <div>
        <h1 className="text-base font-bold text-gray-800">{getPageTitle()}</h1>
      </div>

      {/* Droite : search + icons + avatar */}
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2 w-64 border border-gray-100">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Recherche globale..."
            className="bg-transparent text-xs text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Settings -> Profil */}
        <button
          type="button"
          onClick={() => navigate(profilePath)}
          title="Mon Profil & Paramètres"
          className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <Settings size={18} />
        </button>

        {/* Bell avec badge */}
        <div className="relative">
          <button
            type="button"
            title="Notifications"
            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Bell size={18} />
          </button>
          <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
            3
          </span>
        </div>

        {/* Avatar cliquable */}
        <button
          type="button"
          onClick={() => navigate(profilePath)}
          className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-amber-500/30 hover:ring-amber-500 shrink-0 transition-all"
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
            <div className="w-full h-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
              {initiales}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
