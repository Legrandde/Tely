import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import SideBarMenuItem from "./ui/SideBarMenuItem";
import {
  LayoutDashboard,
  TrendingUp,
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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutLocal } = useAuth();

  function handleLogout() {
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

  return (
    <aside
      className={`flex flex-col p-3 bg-white border-r border-gray-100 h-screen transition-all duration-300 shrink-0 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-gray-100">
        {!collapsed && (
          <h1
            onClick={() => navigate("")}
            className="text-amber-600 cursor-pointer italic font-bold text-base"
          >
            Tely Elearning
          </h1>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors mx-auto cursor-pointer"
          title={collapsed ? "Agrandir" : "Réduire"}
        >
          <FiSidebar size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 py-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {!collapsed && (
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
            Gestion & Contenus
          </span>
        )}
        {navItems.map((item) => (
          <SideBarMenuItem
            key={item.route}
            OnNavigate={() => navigate(item.route)}
            icons={item.icon}
            Titre={item.label}
            isActive={isRouteActive(item.route)}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Déconnexion en bas */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <SideBarMenuItem
          OnNavigate={handleLogout}
          icons={<LogOut size={19} />}
          Titre="Déconnexion"
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
