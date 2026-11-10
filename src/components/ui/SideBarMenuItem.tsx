import React from "react";

interface SideBarMenuItemProps {
  icons: React.ReactNode;
  Titre: string;
  collapsed?: boolean;
  isActive?: boolean;
  badge?: string | number;
  OnNavigate: () => void;
}

export default function SideBarMenuItem({
  icons,
  Titre,
  collapsed,
  isActive = false,
  badge,
  OnNavigate,
}: SideBarMenuItemProps) {
  return (
    <button
      type="button"
      onClick={OnNavigate}
      title={collapsed ? Titre : undefined}
      className={`flex h-10 items-center rounded-xl p-3 cursor-pointer transition-all duration-200 text-left w-full ${
        isActive
          ? "bg-amber-500 text-white shadow-sm font-medium"
          : "text-gray-600 hover:bg-amber-50 hover:text-amber-600 bg-transparent"
      } ${collapsed ? "justify-center" : "justify-between"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}>{icons}</span>
        {!collapsed && <span className="text-sm truncate">{Titre}</span>}
      </div>
      {!collapsed && badge !== undefined && (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            isActive ? "bg-amber-600/60 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
