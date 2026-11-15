import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../context/SidebarContext";
import SideBarEleve from "../components/eleve/SideBarEleve";
import HeaderEleve from "../components/eleve/HeaderEleve";

/**
 * Layout de l'espace élève (/espace/*) : même modèle que ProfesseurLayout
 * (sidebar desktop repliable + tiroir mobile, header, contenu défilant).
 */
export default function EleveLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen max-w-full tely-page overflow-hidden">
        <SideBarEleve />
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <HeaderEleve />
          <main
            id="contenu-eleve"
            className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 tely-page min-w-0"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
