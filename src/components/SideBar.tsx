import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import SideBarMenuItem from "./ui/SideBarMenuItem";
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
  X,
  UserCog,
  FileText,
  Image,
  ScrollText,
  ExternalLink,
  UserCircle2,
  Newspaper,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useSidebar } from "../context/SidebarContext";
import { logout } from "../services/authService";
import ConfirmModal from "./ui/ConfirmModal";

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
      { route: "", label: "Vue d'ensemble", icon: <LayoutDashboard size={19} /> },
      { route: "statistiques", label: "Statistiques", icon: <TrendingUp size={19} /> },
    ],
  },
  {
    id: "contenu",
    label: "Contenu pédagogique",
    items: [
      { route: "exercices", label: "Exercices", icon: <BookOpen size={19} /> },
      { route: "sujets", label: "Sujets d'examen", icon: <ClipboardList size={19} /> },
      { route: "corrections", label: "Corrections", icon: <CheckCircle2 size={19} /> },
      { route: "matieres", label: "Matières", icon: <Library size={19} /> },
      { route: "niveaux", label: "Niveaux", icon: <Layers size={19} /> },
      { route: "categories", label: "Catégories", icon: <Tag size={19} /> },
    ],
  },
  {
    id: "site",
    label: "Site & CMS",
    items: [
      { route: "pages", label: "Pages", icon: <FileText size={19} /> },
      { route: "blog", label: "Blog", icon: <Newspaper size={19} /> },
      { route: "medias", label: "Médiathèque", icon: <Image size={19} /> },
    ],
  },
  {
    id: "communaute",
    label: "Communauté",
    items: [
      { route: "utilisateurs", label: "Utilisateurs", icon: <UserCog size={19} /> },
      { route: "eleves", label: "Élèves", icon: <Users size={19} /> },
      { route: "professeurs", label: "Professeurs", icon: <GraduationCap size={19} /> },
      { route: "candidatures", label: "Candidatures", icon: <UserCheck size={19} /> },
    ],
  },
  {
    id: "systeme",
    label: "Système",
    items: [
      { route: "journal", label: "Journal d'audit", icon: <ScrollText size={19} /> },
      { route: "parametres", label: "Paramètres", icon: <Settings size={19} /> },
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
        /* stockage indisponible : préférence non mémorisée */
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

  const renderItem = (item: NavItem, isCollapsedView: boolean) => {
    const actif = isRouteActive(item.route);
    return (
      <button
        key={item.route || "accueil"}
        type="button"
        onClick={() => handleNavigate(item.route)}
        title={isCollapsedView ? item.label : undefined}
        aria-label={isCollapsedView ? item.label : undefined}
        aria-current={actif ? "page" : undefined}
        className={`flex h-9 items-center gap-3 rounded-[10px] px-3 cursor-pointer transition-all duration-200 text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
          actif
            ? "bg-gray-900 text-white font-semibold"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
        } ${isCollapsedView ? "justify-center" : ""}`}
      >
        <span className={`shrink-0 ${actif ? "text-white" : "text-gray-900"}`}>{item.icon}</span>
        {!isCollapsedView && <span className="text-sm truncate">{item.label}</span>}
      </button>
    );
  };

  const navContent = (isMobileView: boolean) => {
    const isCollapsedView = isMobileView ? false : collapsed;

    return (
      <>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-gray-100">
          {!isCollapsedView && (
            <button
              type="button"
              onClick={() => handleNavigate("")}
              className="tely-title text-lg cursor-pointer text-left"
            >
              Tely Elearning
            </button>
          )}
          {isMobileView ? (
            <button
              type="button"
              onClick={closeMobile}
              className="tely-icon-btn"
              title="Fermer le menu"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="tely-icon-btn mx-auto"
              title={collapsed ? "Agrandir" : "Réduire"}
              aria-label={collapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral"}
              aria-expanded={!collapsed}
            >
              <FiSidebar size={18} />
            </button>
          )}
        </div>

        {/* Navigation groupée */}
        <nav
          aria-label="Navigation administrateur"
          className="flex flex-col gap-3 py-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar"
        >
          {NAV_GROUPS.map((groupe, index) => {
            const groupeActif = groupe.items.some((i) => isRouteActive(i.route));
            const ouvert = isCollapsedView || groupeActif || !groupesFermes.includes(groupe.id);
            const listeId = `sidebar-groupe-${groupe.id}-${isMobileView ? "m" : "d"}`;

            return (
              <div key={groupe.id} className="flex flex-col gap-0.5">
                {isCollapsedView ? (
                  index > 0 && <div className="tely-divider mx-3 my-1" aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    onClick={() => basculerGroupe(groupe.id)}
                    aria-expanded={ouvert}
                    aria-controls={listeId}
                    disabled={groupeActif}
                    className="flex items-center justify-between px-3 py-1 rounded-md tely-overline hover:text-gray-900 cursor-pointer disabled:cursor-default disabled:hover:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    {groupe.label}
                    {!groupeActif && (
                      <ChevronDown
                        size={13}
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${ouvert ? "" : "-rotate-90"}`}
                      />
                    )}
                  </button>
                )}
                {ouvert && (
                  <div id={listeId} className="flex flex-col gap-0.5">
                    {groupe.items.map((item) => renderItem(item, isCollapsedView))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Voir le site + Compte + Déconnexion */}
        <div className="pt-2.5 border-t border-gray-100 mt-auto space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsedView ? "Voir le site (nouvel onglet)" : undefined}
            aria-label={isCollapsedView ? "Voir le site (nouvel onglet)" : undefined}
            className={`flex h-10 items-center gap-3 rounded-[10px] p-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
              isCollapsedView ? "justify-center" : ""
            }`}
          >
            <ExternalLink size={19} className="shrink-0 text-gray-900" />
            {!isCollapsedView && (
              <span className="text-sm truncate">
                Voir le site <span className="sr-only">(nouvel onglet)</span>
              </span>
            )}
          </a>
          <SideBarMenuItem
            OnNavigate={() => handleNavigate("profile")}
            icons={<UserCircle2 size={19} />}
            Titre="Mon compte"
            isActive={isAccountSectionActive}
            collapsed={isCollapsedView}
          />
          <SideBarMenuItem
            OnNavigate={() => setConfirmLogoutOpen(true)}
            icons={<LogOut size={19} />}
            Titre="Déconnexion"
            collapsed={isCollapsedView}
          />
        </div>
      </>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar (lg screens and above) ── */}
      <aside
        className={`hidden lg:flex flex-col p-3 bg-white h-screen transition-all duration-300 shrink-0 select-none ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {navContent(false)}
      </aside>

      {/* ── Mobile Drawer (under lg screens) ── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Menu de navigation">
          {/* Backdrop */}
          <div
            onClick={closeMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200">
            {navContent(true)}
          </aside>
        </div>
      )}

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
