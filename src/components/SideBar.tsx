"use client";

import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import SideBarMenuItem from "./ui/SideBarMenuItem";
import { LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList } from "lucide-react";


export default function SideBar() {
  const [collapsed, setCollapsed] = useState(false);

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
        <SideBarMenuItem icons={<LayoutDashboard size={20} />} Titre="Tableau de bord" collapsed={collapsed} />
<SideBarMenuItem icons={<Users size={20} />} Titre="Utilisateurs" collapsed={collapsed} />
<SideBarMenuItem icons={<GraduationCap size={20} />} Titre="Professeurs" collapsed={collapsed} />
<SideBarMenuItem icons={<BookOpen size={20} />} Titre="Exercices" collapsed={collapsed} />
<SideBarMenuItem icons={<ClipboardList size={20} />} Titre="Sujets Examens" collapsed={collapsed} />
      </div>
    </div>
  );
}