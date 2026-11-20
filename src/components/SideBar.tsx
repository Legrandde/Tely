import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Library,
  Layers,
  Tag,
  Settings,
  LogOut,
  ChevronDown,
  UserCog,
  FileText,
  Image,
  ScrollText,
  ExternalLink,
  UserCircle2,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { useSidebar } from "@/context/SidebarContext";
import { logout } from "@/services/authService";
import SideBarMenuItem from "@/components/ui/SideBarMenuItem";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  route: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "pilotage",
    label: "Pilotage",
    items: [
      { route: "", label: "Vue d'ensemble", icon: <LayoutDashboard className="size-4" /> },
      { route: "statistiques", label: "Statistiques", icon: <TrendingUp className="size-4" /> },
    ],
  },
  {
    id: "contenu",
    label: "Contenu pédagogique",
    items: [
      { route: "exercices", label: "Exercices", icon: <BookOpen className="size-4" /> },
      { route: "sujets", label: "Sujets d'examen", icon: <ClipboardList className="size-4" /> },
      { route: "corrections", label: "Corrections", icon: <CheckCircle2 className="size-4" /> },
      { route: "matieres", label: "Matières", icon: <Library className="size-4" /> },
      { route: "niveaux", label: "Niveaux", icon: <Layers className="size-4" /> },
      { route: "categories", label: "Catégories", icon: <Tag className="size-4" /> },
    ],
  },
  {
    id: "site",
    label: "Site & CMS",
    items: [
      { route: "pages", label: "Pages", icon: <FileText className="size-4" /> },
      { route: "blog", label: "Blog", icon: <Newspaper className="size-4" /> },
      { route: "medias", label: "Médiathèque", icon: <Image className="size-4" /> },
    ],
  },
  {
    id: "communaute",
    label: "Communauté",
    items: [
      { route: "utilisateurs", label: "Utilisateurs", icon: <UserCog className="size-4" /> },
      { route: "eleves", label: "Élèves", icon: <Users className="size-4" /> },
      { route: "professeurs", label: "Professeurs", icon: <GraduationCap className="size-4" /> },
      { route: "candidatures", label: "Candidatures", icon: <UserCheck className="size-4" /> },
    ],
  },
  {
    id: "systeme",
    label: "Système",
    items: [
      { route: "journal", label: "Journal d'audit", icon: <ScrollText className="size-4" /> },
      { route: "parametres", label: "Paramètres", icon: <Settings className="size-4" /> },
    ],
  },
];

const CLE_GROUPES_FERMES = "tely.admin.sidebar.groupesFermes";

function lireGroupesFermes(): string[] {
  try {
    const brut = localStorage.getItem(CLE_GROUPES_FERMES);
    const val: unknown = brut ? JSON.parse(brut) : [];
    return Array.isArray(val) ? val.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [groupesFermes, setGroupesFermes] = useState<string[]>(lireGroupesFermes);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutLocal } = useAuth();
  const { isOpenMobile, closeMobile } = useSidebar();

  const currentPath = location.pathname.toLowerCase();

  const isRouteActive = (route: string) => {
    if (route === "") {
      return (
        currentPath === "/dashbord-admin" ||
        currentPath === "/dashbord-admin/" ||
        currentPath === "/dashbord-admin/overview"
      );
    }
    const base = `/dashbord-admin/${route.toLowerCase()}`;
    return currentPath === base || currentPath.startsWith(`${base}/`);
  };

  const isAccountSectionActive = ["profile", "notifications"].some((r) => isRouteActive(r));

  function basculerGroupe(id: string) {
    setGroupesFermes((prev) => {
      const suivant = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try {
        localStorage.setItem(CLE_GROUPES_FERMES, JSON.stringify(suivant));
      } catch {
        /* stockage indisponible */
      }
      return suivant;
    });
  }

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

  const handleNavigate = (route: string) => {
    if (!route) {
      navigate("/Dashbord-admin");
    } else {
      navigate(`/Dashbord-admin/${route}`);
    }
    closeMobile();
  };

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
              className="tely-title text-base cursor-pointer flex items-center gap-2"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                T
              </span>
              <span>
                Tely <span className="text-amber-500">Admin</span>
              </span>
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
              aria-label={collapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          )}
        </div>

        {/* Navigation groupée */}
        <nav
          aria-label="Navigation administrateur"
          className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar"
        >
          {NAV_GROUPS.map((groupe, index) => {
            const groupeActif = groupe.items.some((i) => isRouteActive(i.route));
            const ouvert = isCollapsedView || groupeActif || !groupesFermes.includes(groupe.id);
            const listeId = `sidebar-groupe-${groupe.id}-${isMobileView ? "m" : "d"}`;

            return (
              <div key={groupe.id} className="flex flex-col gap-0.5">
                {isCollapsedView ? (
                  index > 0 && <Separator className="my-1.5" />
                ) : (
                  <button
                    type="button"
                    onClick={() => basculerGroupe(groupe.id)}
                    aria-expanded={ouvert}
                    aria-controls={listeId}
                    disabled={groupeActif}
                    className="flex items-center justify-between px-2.5 py-1 rounded-md tely-overline hover:text-foreground cursor-pointer disabled:cursor-default disabled:hover:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {groupe.label}
                    {!groupeActif && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-150",
                          !ouvert && "-rotate-90"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
                {ouvert && (
                  <div id={listeId} className="flex flex-col gap-0.5">
                    {groupe.items.map((item) => (
                      <SideBarMenuItem
                        key={item.route || "accueil"}
                        OnNavigate={() => handleNavigate(item.route)}
                        icons={item.icon}
                        Titre={item.label}
                        isActive={isRouteActive(item.route)}
                        collapsed={isCollapsedView}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Voir le site + Compte + Déconnexion */}
        <div className="p-3 border-t border-border mt-auto space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsedView ? "Voir le site (nouvel onglet)" : undefined}
            aria-label={isCollapsedView ? "Voir le site (nouvel onglet)" : undefined}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsedView && "justify-center px-0"
            )}
          >
            <ExternalLink className="size-4 shrink-0" />
            {!isCollapsedView && (
              <span className="truncate">
                Voir le site <span className="sr-only">(nouvel onglet)</span>
              </span>
            )}
          </a>
          <SideBarMenuItem
            OnNavigate={() => handleNavigate("profile")}
            icons={<UserCircle2 className="size-4" />}
            Titre="Mon compte"
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
          <SheetTitle className="sr-only">Menu de navigation administrateur</SheetTitle>
          {navContent(true)}
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter du tableau de bord administrateur ?"
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
