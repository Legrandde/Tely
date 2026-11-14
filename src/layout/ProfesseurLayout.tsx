import React from "react";
import Header from "../components/Header";
import SideBarProfesseur from "../components/SideBarProfesseur";
import { SidebarProvider } from "../context/SidebarContext";

export default function ProfesseurLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen max-w-full tely-page overflow-hidden">
        {/* Sidebar Enseignant desktop + mobile drawer */}
        <SideBarProfesseur />

        {/* Colonne droite : Header + contenu */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <Header />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 tely-page min-w-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
