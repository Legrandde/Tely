import { useEffect, useState } from "react";
import { Search, Settings, Menu } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../utils/imageUrl";
import { useSidebar } from "../context/SidebarContext";
import NotificationDropdown from "./notifications/NotificationDropdown";
import CommandPalette from "./admin/CommandPalette";

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
  journal: "Journal d'audit",
  medias: "Médiathèque",
  pages: "Pages du site",
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

  /* ── Palette de commandes (administrateurs uniquement) ── */
  const isAdmin = user?.role === "administrateur";
  const [paletteOuverte, setPaletteOuverte] = useState(false);
  const estMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

  useEffect(() => {
    if (!isAdmin) return;
    const raccourci = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOuverte((ouvert) => !ouvert);
      }
    };
    window.addEventListener("keydown", raccourci);
    return () => window.removeEventListener("keydown", raccourci);
  }, [isAdmin]);

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
        <p className="tely-title text-lg sm:text-xl truncate">{getPageTitle()}</p>
      </div>

      {/* Droite : search + icons + avatar */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Recherche globale (admin) : ouvre la palette de commandes */}
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setPaletteOuverte(true)}
              aria-haspopup="dialog"
              aria-keyshortcuts={estMac ? "Meta+K" : "Control+K"}
              className="hidden md:flex items-center gap-2 bg-white rounded-[10px] px-3 py-2.5 w-48 lg:w-64 border border-gray-200 text-left cursor-pointer transition-all duration-200 hover:border-gray-400 outline-none focus-visible:border-gray-900 focus-visible:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]"
            >
              <Search size={15} className="text-gray-900 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-sm text-gray-400 truncate">Recherche globale...</span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-500">
                {estMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOuverte(true)}
              aria-haspopup="dialog"
              aria-label="Recherche globale"
              title="Recherche globale"
              className="md:hidden tely-icon-btn hover:bg-white"
            >
              <Search size={18} />
            </button>
          </>
        )}

        {/* Settings -> Paramètres */}
        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          title="Paramètres & Configuration"
          aria-label="Paramètres"
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
          aria-label={`Profil de ${nomComplet || "l'utilisateur"}`}
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

      {isAdmin && paletteOuverte && <CommandPalette onClose={() => setPaletteOuverte(false)} />}
    </div>
  );
}
