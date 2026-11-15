import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { User, Settings, Bell } from "lucide-react";
import ProfilePage from "./ProfilePage";
import ParametresPage from "./ParametresPage";
import NotificationsPage from "./NotificationsPage";
import { useAuth } from "../context/authContext";

type AccountTab = "profile" | "parametres" | "notifications";

export default function EspaceComptePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const path = location.pathname.toLowerCase();
  // Espace élève : une seule route (/espace/compte), l'onglet est porté par ?onglet=
  const estEspaceEleve = path.startsWith("/espace");
  const onglet = searchParams.get("onglet");

  const activeTab: AccountTab = estEspaceEleve
    ? onglet === "parametres" || onglet === "notifications"
      ? onglet
      : "profile"
    : path.includes("parametres")
    ? "parametres"
    : path.includes("notifications")
    ? "notifications"
    : "profile";

  const basePath = path.includes("/dashbord-admin")
    ? "/Dashbord-admin"
    : path.includes("/dashboard-professeur")
    ? "/Dashboard-professeur"
    : "";

  const handleTabChange = (tab: AccountTab) => {
    if (estEspaceEleve) {
      navigate(tab === "profile" ? "/espace/compte" : `/espace/compte?onglet=${tab}`);
      return;
    }
    navigate(`${basePath}/${tab}`);
  };

  const tabs: Array<{
    key: AccountTab;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "profile",
      label: "Mon Profil",
      description: "Identité, photo & mot de passe",
      icon: <User size={17} />,
    },
    {
      key: "parametres",
      label: "Paramètres",
      description:
        user?.role === "administrateur"
          ? "Configuration & règles plateforme"
          : "Préférences & options",
      icon: <Settings size={17} />,
    },
    {
      key: "notifications",
      label: "Notifications",
      description: "Centre d'alertes & activités",
      icon: <Bell size={17} />,
    },
  ];

  return (
    <div className={`${estEspaceEleve ? "pb-8" : "p-4 sm:p-6 lg:p-8"} max-w-5xl mx-auto space-y-6`}>
      {/* ── Barre d'onglets unifiée (Mon Profil / Paramètres / Notifications) ── */}
      <div className="tely-card p-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-gray-50 text-gray-900"
                  }`}
                >
                  {tab.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold truncate">
                    {tab.label}
                  </p>
                  <p
                    className={`text-[11px] truncate ${
                      isActive ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contenu de l'onglet actif ── */}
      <div>
        {activeTab === "profile" && <ProfilePage embedded />}
        {activeTab === "parametres" && <ParametresPage embedded />}
        {activeTab === "notifications" && <NotificationsPage embedded />}
      </div>
    </div>
  );
}
