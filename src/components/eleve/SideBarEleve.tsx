import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  Heart,
  History,
  UserCog,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import SideBarMenuItem from "../ui/SideBarMenuItem";
import ConfirmModal from "../ui/ConfirmModal";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/SidebarContext";
import { logout } from "../../services/authService";
import { reinitialiserFavoris } from "../../hooks/useFavoris";
import { resolveImageUrl } from "../../utils/imageUrl";

interface ItemNav {
  chemin: string;
  label: string;
  icone: React.ReactNode;
  /** Correspondance exacte (tableau de bord) ou par préfixe */
  exact?: boolean;
}

const SECTIONS: Array<{ titre: string; items: ItemNav[] }> = [
  {
    titre: "Mon espace",
    items: [
      { chemin: "/espace", label: "Tableau de bord", icone: <LayoutDashboard size={19} />, exact: true },
      { chemin: "/espace/favoris", label: "Mes favoris", icone: <Heart size={19} /> },
      { chemin: "/espace/historique", label: "Historique", icone: <History size={19} /> },
    ],
  },
  {
    titre: "Réviser",
    items: [
      { chemin: "/exercices", label: "Explorer les exercices", icone: <Compass size={19} /> },
      { chemin: "/sujets", label: "Sujets d'examen", icone: <ClipboardList size={19} /> },
    ],
  },
];

export default function SideBarEleve() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutLocal } = useAuth();
  const { isOpenMobile, closeMobile } = useSidebar();

  const chemin = location.pathname.toLowerCase().replace(/\/+$/, "") || "/";

  // Échap ferme le menu mobile
  useEffect(() => {
    if (!isOpenMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpenMobile, closeMobile]);

  const estActif = (item: ItemNav) =>
    item.exact ? chemin === item.chemin : chemin === item.chemin || chemin.startsWith(`${item.chemin}/`);

  function aller(cible: string) {
    navigate(cible);
    closeMobile();
  }

  async function confirmerDeconnexion() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      closeMobile();
      reinitialiserFavoris();
      logoutLocal();
      navigate("/");
    }
  }

  const avatar = resolveImageUrl(user?.avatar_url || user?.avatar);
  const initiale = (user?.prenom?.[0] ?? user?.nom?.[0] ?? "É").toUpperCase();

  const contenu = (mobile: boolean) => {
    const reduit = mobile ? false : collapsed;
    return (
      <>
        <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-gray-100">
          {!reduit && (
            <button type="button" onClick={() => aller("/espace")} className="tely-title text-lg cursor-pointer">
              Tely <span className="text-amber-500">Élève</span>
            </button>
          )}
          {mobile ? (
            <button type="button" onClick={closeMobile} className="tely-icon-btn" aria-label="Fermer le menu">
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className={`tely-icon-btn ${reduit ? "mx-auto" : ""}`}
              aria-label={reduit ? "Agrandir le menu" : "Réduire le menu"}
              title={reduit ? "Agrandir" : "Réduire"}
            >
              {reduit ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}
        </div>

        <nav aria-label="Navigation de l'espace élève" className="flex flex-col gap-1 py-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {SECTIONS.map((section) => (
            <div key={section.titre} className="flex flex-col gap-1 mb-2">
              {!reduit && <span className="tely-overline px-3 mb-1">{section.titre}</span>}
              {section.items.map((item) => (
                <SideBarMenuItem
                  key={item.chemin}
                  OnNavigate={() => aller(item.chemin)}
                  icons={item.icone}
                  Titre={item.label}
                  isActive={estActif(item)}
                  collapsed={reduit}
                />
              ))}
            </div>
          ))}
        </nav>

        {!reduit && user && (
          <button
            type="button"
            onClick={() => aller("/espace/compte")}
            className="mb-2 p-2.5 rounded-[10px] bg-gray-50 flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 transition-colors text-left w-full"
          >
            <span className="w-8 h-8 rounded-full overflow-hidden bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {avatar ? (
                <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                initiale
              )}
            </span>
            <span className="min-w-0">
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {user.prenom} {user.nom}
              </span>
              <span className="text-[10px] text-gray-400 font-medium block truncate">
                {user.eleve?.niveau?.libelle ?? "Élève"} • Mon compte
              </span>
            </span>
          </button>
        )}

        <div className="pt-2 border-t border-gray-100 space-y-1">
          <SideBarMenuItem
            OnNavigate={() => aller("/espace/compte")}
            icons={<UserCog size={19} />}
            Titre="Mon compte"
            isActive={chemin.startsWith("/espace/compte")}
            collapsed={reduit}
          />
          <SideBarMenuItem
            OnNavigate={() => setConfirmLogoutOpen(true)}
            icons={<LogOut size={19} />}
            Titre="Déconnexion"
            collapsed={reduit}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col p-3 bg-white h-screen transition-all duration-300 shrink-0 select-none ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {contenu(false)}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Menu de l'espace élève">
          <div onClick={closeMobile} className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl z-10 select-none">
            {contenu(true)}
          </aside>
        </div>
      )}

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Confirmer la déconnexion"
        description="Vous pourrez retrouver vos favoris et votre progression à votre prochaine connexion."
        confirmLabel="Se déconnecter"
        loadingLabel="Déconnexion..."
        loading={loggingOut}
        onConfirm={confirmerDeconnexion}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
