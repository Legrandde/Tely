import React from "react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex h-9 items-center rounded-lg px-2.5 cursor-pointer transition-colors duration-150 text-left w-full text-sm",
        isActive
          ? "bg-primary text-primary-foreground font-medium shadow-2xs"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        collapsed ? "justify-center px-0" : "justify-between"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
          {icons}
        </span>
        {!collapsed && <span className="truncate">{Titre}</span>}
      </div>
      {!collapsed && badge !== undefined && (
        <span
          className={cn(
            "text-[11px] px-1.5 py-0.5 rounded-md font-medium",
            isActive
              ? "bg-primary-foreground/15 text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
