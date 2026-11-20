import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  Heart,
  History,
  UserCog,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import SideBarMenuItem from "@/components/ui/SideBarMenuItem";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { useSidebar } from "@/context/SidebarContext";
import { logout } from "@/services/authService";
import { reinitialiserFavoris } from "@/hooks/useFavoris";
import { resolveImageUrl } from "@/utils/imageUrl";
import { cn } from "@/lib/utils";

interface ItemNav {
  chemin: string;
  label: string;
  icone: React.ReactNode;
  exact?: boolean;
}

const SECTIONS: Array<{ titre: string; items: ItemNav[] }> = [
  {
    titre: "Mon espace",
    items: [
      { chemin: "/espace", label: "Tableau de bord", icone: <LayoutDashboard className="size-4" />, exact: true },
      { chemin: "/espace/favoris", label: "Mes favoris", icone: <Heart className="size-4" /> },
      { chemin: "/espace/historique", label: "Historique", icone: <History className="size-4" /> },
    ],
  },
  {
    titre: "Réviser",
    items: [
      { chemin: "/exercices", label: "Explorer les exercices", icone: <Compass className="size-4" /> },
      { chemin: "/sujets", label: "Sujets d'examen", icone: <ClipboardList className="size-4" /> },
    ],
  },
];

export default function SideBarEleve() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutLocal } = useAuth();
  const { isOpenMobile, closeMobile } = useSidebar();

  const chemin = location.pathname.toLowerCase().replace(/\/+$/, "") || "/";

  const estActif = (item: ItemNav) =>
    item.exact ? chemin === item.chemin : chemin === item.chemin || chemin.startsWith(`${item.chemin}/`);

  function aller(cible: string) {
    navigate(cible);
    closeMobile();
  }

  async function confirmerDeconnexion() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      closeMobile();
      reinitialiserFavoris();
      logoutLocal();
      navigate("/");
    }
  }

  const avatar = resolveImageUrl(user?.avatar_url || user?.avatar);
  const initiale = (user?.prenom?.[0] ?? user?.nom?.[0] ?? "É").toUpperCase();

  const contenu = (mobile: boolean) => {
    const reduit = mobile ? false : collapsed;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-3 border-b border-border shrink-0">
          {!reduit && (
            <button
              type="button"
              onClick={() => aller("/espace")}
              className="tely-title text-base cursor-pointer flex items-center gap-2"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                T
              </span>
              <span>
                Tely <span className="text-amber-500">Élève</span>
              </span>
            </button>
          )}
          {!mobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((c) => !c)}
              className={cn(reduit && "mx-auto")}
              aria-label={reduit ? "Agrandir le menu" : "Réduire le menu"}
              title={reduit ? "Agrandir" : "Réduire"}
            >
              {reduit ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          )}
        </div>

        <nav
          aria-label="Navigation de l'espace élève"
          className="flex flex-col gap-4 p-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar"
        >
          {SECTIONS.map((section) => (
            <div key={section.titre} className="flex flex-col gap-1">
              {!reduit && <span className="tely-overline px-2.5 mb-1">{section.titre}</span>}
              {section.items.map((item) => (
                <SideBarMenuItem
                  key={item.chemin}
                  OnNavigate={() => aller(item.chemin)}
                  icons={item.icone}
                  Titre={item.label}
                  isActive={estActif(item)}
                  collapsed={reduit}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1.5">
          {!reduit && user && (
            <button
              type="button"
              onClick={() => aller("/espace/compte")}
              className="mb-1 p-2 rounded-lg border border-border bg-secondary/40 flex items-center gap-2.5 cursor-pointer hover:bg-secondary transition-colors text-left w-full"
            >
              <Avatar className="size-8">
                {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initiale}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="text-xs font-semibold text-foreground truncate block">
                  {user.prenom} {user.nom}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {user.eleve?.niveau?.libelle ?? "Élève"}
                </span>
              </span>
            </button>
          )}

          <SideBarMenuItem
            OnNavigate={() => aller("/espace/compte")}
            icons={<UserCog className="size-4" />}
            Titre="Mon compte"
            isActive={chemin.startsWith("/espace/compte")}
            collapsed={reduit}
          />
          <SideBarMenuItem
            OnNavigate={() => setConfirmLogoutOpen(true)}
            icons={<LogOut className="size-4" />}
            Titre="Déconnexion"
            collapsed={reduit}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border h-screen transition-all duration-200 shrink-0 select-none",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {contenu(false)}
      </aside>

      <Sheet open={isOpenMobile} onOpenChange={(open) => { if (!open) closeMobile(); }}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Menu de l'espace élève</SheetTitle>
          {contenu(true)}
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Vous pourrez retrouver vos favoris et votre progression à votre prochaine connexion."
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmerDeconnexion}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
