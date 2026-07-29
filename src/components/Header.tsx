import { Search, Settings, Bell } from "lucide-react";
import { useAuth } from "../context/authContext";


export default function Header({ title = "Tableau de bord" }: { title?: string }) {
  const { user } = useAuth();

  const nomComplet = user
    ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
    : "";
  const initiales = nomComplet
    ? nomComplet
        .split(" ")
        .filter(Boolean)
        .map((mot) => mot.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  return (
    <div className="flex items-center h-14 justify-between px-6 py-4 bg-white shadow-sm w-full">
      
      {/* Titre page */}
      <h1 className="text-base font-bold text-gray-800">{title}</h1>

      {/* Droite : search + icons + avatar */}
      <div className="flex items-center gap-4">
        
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Settings */}
        <Settings size={20} className="text-gray-500 cursor-pointer hover:text-amber-500 transition-colors" />

        {/* Bell avec badge */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-500 hover:text-amber-500 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </div>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-amber-500 flex-shrink-0"
          title={nomComplet || undefined}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={nomComplet || "avatar"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">
              {initiales}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}