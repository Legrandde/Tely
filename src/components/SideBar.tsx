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
  User,
  LogOut,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useSidebar } from "../context/SidebarContext";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutLocal } = useAuth();
  const { isOpenMobile, closeMobile } = useSidebar();

  function handleLogout() {
    closeMobile();
    logoutLocal();
    navigate("/auth/login");
  }

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

  const navItems = [
    { route: "", label: "Tableau de bord", icon: <LayoutDashboard size={19} /> },
    { route: "statistiques", label: "Statistiques & Trafic", icon: <TrendingUp size={19} /> },
    { route: "candidatures", label: "Candidatures Profs", icon: <UserCheck size={19} /> },
    { route: "exercices", label: "Exercices", icon: <BookOpen size={19} /> },
    { route: "sujets", label: "Sujets Examens", icon: <ClipboardList size={19} /> },
    { route: "corrections", label: "Corrections", icon: <CheckCircle2 size={19} /> },
    { route: "eleves", label: "Élèves", icon: <Users size={19} /> },
    { route: "professeurs", label: "Professeurs", icon: <GraduationCap size={19} /> },
    { route: "matieres", label: "Matières", icon: <Library size={19} /> },
    { route: "niveaux", label: "Niveaux", icon: <Layers size={19} /> },
    { route: "categories", label: "Catégories", icon: <Tag size={19} /> },
    { route: "profile", label: "Mon Profil", icon: <User size={19} /> },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    closeMobile();
  };

  const navContent = (isMobileView: boolean) => (
    <>
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-gray-100">
        {(!collapsed || isMobileView) && (
          <h1
            onClick={() => handleNavigate("")}
            className="text-amber-600 cursor-pointer italic font-bold text-base"
          >
            Tely Elearning
          </h1>
        )}
        {isMobileView ? (
          <button
            type="button"
            onClick={closeMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Fermer le menu"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors mx-auto cursor-pointer"
            title={collapsed ? "Agrandir" : "Réduire"}
          >
            <FiSidebar size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 py-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {(!collapsed || isMobileView) && (
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Gestion & Contenus
          </span>
        )}
        {navItems.map((item) => (
          <SideBarMenuItem
            key={item.route}
            OnNavigate={() => handleNavigate(item.route)}
            icons={item.icon}
            Titre={item.label}
            isActive={isRouteActive(item.route)}
            collapsed={isMobileView ? false : collapsed}
          />
        ))}
      </div>

      {/* Déconnexion en bas */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <SideBarMenuItem
          OnNavigate={handleLogout}
          icons={<LogOut size={19} />}
          Titre="Déconnexion"
          collapsed={isMobileView ? false : collapsed}
        />
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar (lg screens and above) ── */}
      <aside
        className={`hidden lg:flex flex-col p-3 bg-white border-r border-gray-100 h-screen transition-all duration-300 shrink-0 select-none ${
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
    </>
  );
}
