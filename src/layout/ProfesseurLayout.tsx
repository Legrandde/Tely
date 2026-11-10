import React from "react";
import Header from "../components/Header";
import SideBarProfesseur from "../components/SideBarProfesseur";

export default function ProfesseurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Enseignant */}
      <SideBarProfesseur />

      {/* Colonne droite : Header + contenu */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/40">
          {children}
        </main>
      </div>
    </div>
  );
}
