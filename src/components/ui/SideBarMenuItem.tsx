

interface SideBarMenuItemProps {
  icons: React.ReactNode;
  Titre: string;
  collapsed?: boolean;
  OnNavigate: ()=> void;
}

export default function SideBarMenuItem({ icons, Titre, collapsed, OnNavigate}: SideBarMenuItemProps) {
  return (
    <div
      onClick={ OnNavigate}
      className={`flex h-10 items-center hover:text-white hover:bg-amber-500 rounded-lg p-3 bg-white cursor-pointer transition-all duration-300 ${
        collapsed ? "justify-center w-10" : "justify-between w-full"
      }`}
    >
      <div className="gap-4 flex items-center">
        {icons}
        {!collapsed && <span className="text-base">{Titre}</span>}
      </div>
      {!collapsed && <span>99</span>}
    </div>
  );
}