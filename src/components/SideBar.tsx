"use client";

import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import SideBarMenuItem from "./ui/SideBarMenuItem";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logoutLocal } = useAuth();

  function handleLogout() {
    logoutLocal();
    navigate("/auth/login");
  }

  return (
    <div
      className={`flex flex-col p-2 gap-4 bg-white rounded h-screen shadow transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="flex p-3 items-center justify-between">
        {!collapsed && (
          <h1 className="text-amber-500 text-base">Tely E-learning</h1>
        )}
        <FiSidebar
          size={20}
          className="cursor-pointer text-amber-500"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <div className="flex border-gray-200 border flex-col gap-1">
        <SideBarMenuItem OnNavigate={() => navigate('')} icons={<LayoutDashboard size={20} />} Titre="Tableau de bord" collapsed={collapsed} />
        <SideBarMenuItem OnNavigate={() => navigate('eleves')} icons={<Users size={20} />} Titre="Utilisateurs" collapsed={collapsed} />
        <SideBarMenuItem OnNavigate={() => navigate('professeurs')} icons={<GraduationCap size={20} />} Titre="Professeurs" collapsed={collapsed} />
        <SideBarMenuItem OnNavigate={() => navigate('exercices')} icons={<BookOpen size={20} />} Titre="Exercices" collapsed={collapsed} />
        <SideBarMenuItem OnNavigate={() => navigate('sujets')} icons={<ClipboardList size={20} />} Titre="Sujets Examens" collapsed={collapsed} />
      </div>

      {/* Déconnexion, poussée en bas */}
      <div className="flex border-gray-200 border flex-col gap-1 mt-auto">
        <SideBarMenuItem
          OnNavigate={handleLogout}
          icons={<LogOut size={20} />}
          Titre="Déconnexion"
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}