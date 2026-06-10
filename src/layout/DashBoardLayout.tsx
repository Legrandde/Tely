import Header from "../components/Header";
import SideBar from "../components/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex  h-screen bg-white overflow-hidden">
      
      {/* Sidebar — colonne gauche */}
      <SideBar />

      {/* Colonne droite : Header + contenu */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
}