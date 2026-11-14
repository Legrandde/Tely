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
  children?: Array<{
    route: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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
    return currentPath.includes(`/dashbord-admin/${route.toLowerCase()}`);
  };

  const userSubRoutes = ["utilisateurs", "eleves", "professeurs", "candidatures"];
  const isUserSectionActive = userSubRoutes.some((r) => isRouteActive(r));
  const [usersOpen, setUsersOpen] = useState<boolean>(true);

  const isAccountSectionActive = ["profile", "parametres", "notifications"].some((r) =>
    isRouteActive(r)
  );

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

  const navItems: NavItem[] = [
    { route: "", label: "Tableau de bord", icon: <LayoutDashboard size={19} /> },
    { route: "statistiques", label: "Statistiques & Trafic", icon: <TrendingUp size={19} /> },
    {
      route: "utilisateurs",
      label: "Utilisateurs",
      icon: <Users size={19} />,
      children: [
        { route: "utilisateurs", label: "Comptes & rôles", icon: <UserCog size={16} /> },
        { route: "eleves", label: "Élèves", icon: <Users size={16} /> },
        { route: "professeurs", label: "Professeurs", icon: <GraduationCap size={16} /> },
        { route: "candidatures", label: "Candidatures Profs", icon: <UserCheck size={16} /> },
      ],
    },
    { route: "exercices", label: "Exercices", icon: <BookOpen size={19} /> },
    { route: "sujets", label: "Sujets Examens", icon: <ClipboardList size={19} /> },
    { route: "corrections", label: "Corrections", icon: <CheckCircle2 size={19} /> },
    { route: "matieres", label: "Matières", icon: <Library size={19} /> },
    { route: "niveaux", label: "Niveaux", icon: <Layers size={19} /> },
    { route: "categories", label: "Catégories", icon: <Tag size={19} /> },
  ];

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
    const showUsersDropdown = usersOpen || isUserSectionActive;

    return (
      <>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-gray-100">
          {!isCollapsedView && (
            <h1
              onClick={() => handleNavigate("")}
              className="tely-title text-lg cursor-pointer"
            >
              Tely Elearning
            </h1>
          )}
          {isMobileView ? (
            <button
              type="button"
              onClick={closeMobile}
              className="tely-icon-btn"
              title="Fermer le menu"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="tely-icon-btn mx-auto"
              title={collapsed ? "Agrandir" : "Réduire"}
            >
              <FiSidebar size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 py-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {!isCollapsedView && (
            <span className="tely-overline px-3 mb-1">
              Gestion & Contenus
            </span>
          )}

          {navItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.route} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCollapsedView) {
                        setCollapsed(false);
                        setUsersOpen(true);
                      } else {
                        setUsersOpen((prev) => !prev);
                      }
                    }}
                    title={isCollapsedView ? item.label : undefined}
                    className={`flex h-10 items-center rounded-[10px] p-3 cursor-pointer transition-all duration-200 text-left w-full ${
                      isUserSectionActive && (!showUsersDropdown || isCollapsedView)
                        ? "bg-gray-900 text-white font-semibold"
                        : isUserSectionActive
                        ? "bg-gray-50 text-gray-900 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
                    } ${isCollapsedView ? "justify-center" : "justify-between"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`shrink-0 ${
                          isUserSectionActive && (!showUsersDropdown || isCollapsedView)
                            ? "text-white"
                            : isUserSectionActive
                            ? "text-gray-900"
                            : "text-gray-900"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsedView && (
                        <span className="text-sm truncate">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsedView && (
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${
                          showUsersDropdown ? "rotate-180" : ""
                        } ${"text-gray-900"}`}
                      />
                    )}
                  </button>

                  {!isCollapsedView && showUsersDropdown && (
                    <div className="ml-5 pl-2.5 border-l border-gray-200 flex flex-col gap-1 py-0.5">
                      {item.children.map((sub) => {
                        const subActive = isRouteActive(sub.route);
                        return (
                          <button
                            key={sub.route}
                            type="button"
                            onClick={() => handleNavigate(sub.route)}
                            className={`flex h-9 items-center gap-2.5 rounded-[10px] px-3 text-left text-xs transition-all cursor-pointer ${
                              subActive
                                ? "bg-gray-900 text-white font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span
                              className={`shrink-0 ${
                                subActive ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {sub.icon}
                            </span>
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <SideBarMenuItem
                key={item.route}
                OnNavigate={() => handleNavigate(item.route)}
                icons={item.icon}
                Titre={item.label}
                isActive={isRouteActive(item.route)}
                collapsed={isCollapsedView}
              />
            );
          })}
        </div>

        {/* Section Compte & Paramètres + Déconnexion en bas */}
        <div className="pt-2.5 border-t border-gray-100 mt-auto space-y-1">
          <SideBarMenuItem
            OnNavigate={() => handleNavigate("profile")}
            icons={<Settings size={19} />}
            Titre="Paramètres & Compte"
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
        <div className="fixed inset-0 z-50 lg:hidden flex">
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
