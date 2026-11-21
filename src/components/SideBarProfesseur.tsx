import { useState } from "react";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { useSidebar } from "@/context/SidebarContext";
import { logout } from "@/services/authService";
import { resolveImageUrl } from "@/utils/imageUrl";
import SideBarMenuItem from "@/components/ui/SideBarMenuItem";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SideBarProfesseur() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutLocal, user } = useAuth();
  const { isOpenMobile, closeMobile } = useSidebar();

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      closeMobile();
      logoutLocal();
      navigate("/auth/login");
    }
  }

  const currentPath = location.pathname.toLowerCase();

  const isRouteActive = (route: string) => {
    if (route === "") {
      return (
        currentPath === "/dashboard-professeur" ||
        currentPath === "/dashboard-professeur/" ||
        currentPath === "/dashboard-professeur/overview"
      );
    }
    return currentPath.includes(`/dashboard-professeur/${route.toLowerCase()}`);
  };

  const isAccountSectionActive = ["profile", "parametres", "notifications"].some((r) =>
    isRouteActive(r)
  );

  const navItems = [
    { route: "", label: "Tableau de bord", icon: <LayoutDashboard className="size-4" /> },
    { route: "exercices", label: "Mes Exercices", icon: <BookOpen className="size-4" /> },
    { route: "sujets", label: "Sujets Examens", icon: <ClipboardList className="size-4" /> },
    { route: "corrections", label: "Corrigés & Solutions", icon: <CheckCircle2 className="size-4" /> },
    { route: "ressources", label: "Documents & PDFs", icon: <FileText className="size-4" /> },
  ];

  const handleNavigate = (route: string) => {
    if (!route) {
      navigate("/Dashboard-professeur");
    } else {
      navigate(`/Dashboard-professeur/${route}`);
    }
    closeMobile();
  };

  const avatar = resolveImageUrl(user?.avatar_url || user?.avatar);

  const navContent = (isMobileView: boolean) => {
    const isCollapsedView = isMobileView ? false : collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-border shrink-0">
          {!isCollapsedView && (
            <button
              type="button"
              onClick={() => handleNavigate("")}
              className="cursor-pointer flex items-center"
            >
              <BrandLogo nom="tely" suffixe="Prof" markClassName="h-6" textClassName="text-lg" />
            </button>
          )}
          {!isMobileView && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(isCollapsedView && "mx-auto")}
              title={collapsed ? "Agrandir" : "Réduire"}
              aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {!isCollapsedView && (
            <span className="tely-overline px-2.5 mb-1">
              Production pédagogique
            </span>
          )}
          {navItems.map((item) => (
            <SideBarMenuItem
              key={item.route}
              OnNavigate={() => handleNavigate(item.route)}
              icons={item.icon}
              Titre={item.label}
              isActive={isRouteActive(item.route)}
              collapsed={isCollapsedView}
            />
          ))}
        </nav>

        {/* Profil + Paramètres & Déconnexion */}
        <div className="p-3 border-t border-border space-y-1.5">
          {!isCollapsedView && user && (
            <button
              type="button"
              onClick={() => handleNavigate("profile")}
              className="mb-1 p-2 rounded-lg border border-border bg-secondary/40 flex items-center gap-2.5 cursor-pointer hover:bg-secondary transition-colors text-left w-full"
              title="Consulter mon profil"
            >
              <Avatar className="size-8">
                {avatar && <AvatarImage src={avatar} alt="" referrerPolicy="no-referrer" />}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(user.prenom?.[0] ?? "P").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user.prenom} {user.nom}
                </p>
                <span className="text-[11px] text-muted-foreground block truncate">
                  Enseignant
                </span>
              </div>
            </button>
          )}

          <SideBarMenuItem
            OnNavigate={() => handleNavigate("profile")}
            icons={<Settings className="size-4" />}
            Titre="Paramètres & Compte"
            isActive={isAccountSectionActive}
            collapsed={isCollapsedView}
          />
          <SideBarMenuItem
            OnNavigate={() => setConfirmLogoutOpen(true)}
            icons={<LogOut className="size-4" />}
            Titre="Déconnexion"
            collapsed={isCollapsedView}
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
        {navContent(false)}
      </aside>

      <Sheet open={isOpenMobile} onOpenChange={(open) => { if (!open) closeMobile(); }}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Menu de l'espace enseignant</SheetTitle>
          {navContent(true)}
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter de votre espace enseignant ?"
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
