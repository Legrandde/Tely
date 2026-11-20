import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useSidebar } from "@/context/SidebarContext";
import { resolveImageUrl } from "@/utils/imageUrl";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    navigate(q ? `/exercices?q=${encodeURIComponent(q)}` : "/exercices");
  }

  return (
    <header className="flex items-center h-16 justify-between gap-3 px-4 sm:px-6 bg-background/95 backdrop-blur-sm border-b border-border w-full shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="lg:hidden shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="tely-title text-base sm:text-lg truncate">{titre}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <form
          role="search"
          onSubmit={rechercher}
          className="hidden md:flex items-center gap-2 bg-card rounded-lg px-3 h-9 w-52 lg:w-72 border border-input transition-all focus-within:border-foreground focus-within:ring-2 focus-within:ring-ring/25"
        >
          <Search className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <label htmlFor="recherche-eleve" className="sr-only">
            Rechercher un exercice
          </label>
          <input
            id="recherche-eleve"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un exercice..."
            className="bg-transparent text-xs sm:text-sm text-foreground outline-none w-full placeholder:text-muted-foreground"
          />
        </form>

        <ThemeToggle />

        <NotificationDropdown />

        <Link
          to="/espace/compte"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          aria-label={`Mon compte (${nomComplet || "élève"})`}
        >
          <Avatar className="size-8">
            {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initiales}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
