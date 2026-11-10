import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import SideBarMenuItem from "./ui/SideBarMenuItem";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function SideBarProfesseur() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutLocal, user } = useAuth();

  function handleLogout() {
    logoutLocal();
    navigate("/auth/login");
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

  const navItems = [
    { route: "", label: "Tableau de bord", icon: <LayoutDashboard size={19} /> },
    { route: "exercices", label: "Mes Exercices", icon: <BookOpen size={19} /> },
    { route: "sujets", label: "Sujets Examens", icon: <ClipboardList size={19} /> },
    { route: "corrections", label: "Corrigés & Solutions", icon: <CheckCircle2 size={19} /> },
    { route: "ressources", label: "Documents & PDFs", icon: <FileText size={19} /> },
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
            Production pédagogique
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

      {/* Profil enseignant en bas */}
      {!collapsed && user && (
        <div
          onClick={() => navigate("profile")}
          className="mb-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/70 flex items-center gap-2.5 cursor-pointer hover:bg-amber-100/60 transition-colors"
          title="Consulter mon profil"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {user.prenom?.[0] ?? "P"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {user.prenom} {user.nom}
            </p>
            <span className="text-[10px] text-amber-700 font-medium block">
              Enseignant • Voir profil
            </span>
          </div>
        </div>
      )}

      {/* Déconnexion en bas */}
      <div className="pt-2 border-t border-gray-100">
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
