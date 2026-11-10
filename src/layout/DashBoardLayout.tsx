import Header from "../components/Header";
import SideBar from "../components/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen max-w-full bg-white overflow-hidden">
      {/* Sidebar — colonne gauche */}
      <SideBar />

      {/* Colonne droite : Header + contenu */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-gray-50/30 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
