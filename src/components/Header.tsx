import { useEffect, useState } from "react";
import { Search, Settings, Menu, User } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveImageUrl } from "@/utils/imageUrl";
import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import CommandPalette from "@/components/admin/CommandPalette";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const estMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

  useEffect(() => {
    if (!isAdmin) return;
    const raccourci = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setPaletteOuverte((ouvert) => !ouvert);
      }
    };
    window.addEventListener("keydown", raccourci);
    return () => window.removeEventListener("keydown", raccourci);
  }, [isAdmin]);

  return (
    <header className="flex items-center h-16 justify-between px-4 sm:px-6 bg-background/95 backdrop-blur-sm border-b border-border w-full shrink-0">
      {/* Bouton Hamburger mobile + Titre page */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="lg:hidden shrink-0"
          aria-label="Ouvrir le menu latéral"
          title="Menu de navigation"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="tely-title text-base sm:text-lg truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Droite : search + icons + avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setPaletteOuverte(true)}
              aria-haspopup="dialog"
              aria-keyshortcuts={estMac ? "Meta+K" : "Control+K"}
              className="hidden md:flex items-center gap-2 bg-card rounded-lg px-3 h-9 w-52 lg:w-64 border border-input text-left cursor-pointer transition-colors hover:bg-secondary/60 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="flex-1 text-xs text-muted-foreground truncate">
                Recherche globale...
              </span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {estMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setPaletteOuverte(true)}
              aria-haspopup="dialog"
              aria-label="Recherche globale"
              title="Recherche globale"
              className="md:hidden"
            >
              <Search className="size-4" />
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate(settingsPath)}
          title="Paramètres & Configuration"
          aria-label="Paramètres"
        >
          <Settings className="size-4 text-muted-foreground" />
        </Button>

        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              title={`Profil de ${nomComplet || "l'utilisateur"}`}
              aria-label={`Profil de ${nomComplet || "l'utilisateur"}`}
            >
              <Avatar className="size-8">
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl}
                    alt={nomComplet || "avatar"}
                    referrerPolicy="no-referrer"
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initiales}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="truncate text-sm font-semibold">{nomComplet || "Utilisateur"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(profilePath)}>
              <User className="size-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate(settingsPath)}>
              <Settings className="size-4" />
              Paramètres
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isAdmin && paletteOuverte && (
        <CommandPalette onClose={() => setPaletteOuverte(false)} />
      )}
    </header>
  );
}
