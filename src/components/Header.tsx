import { Search, Settings, Bell } from "lucide-react";

export default function Header({ title = "Tableau de bord" }: { title?: string }) {
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
        <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-amber-500">
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}