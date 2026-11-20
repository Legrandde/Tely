import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { User, Settings, Bell } from "lucide-react";
import ProfilePage from "./ProfilePage";
import ParametresPage from "./ParametresPage";
import NotificationsPage from "./NotificationsPage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AccountTab = "profile" | "parametres" | "notifications";

export default function EspaceComptePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const path = location.pathname.toLowerCase();
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

  const handleTabChange = (val: string) => {
    const tab = val as AccountTab;
    if (estEspaceEleve) {
      navigate(tab === "profile" ? "/espace/compte" : `/espace/compte?onglet=${tab}`);
      return;
    }
    navigate(`${basePath}/${tab}`);
  };

  return (
    <div className={`${estEspaceEleve ? "pb-8" : "p-4 sm:p-6 lg:p-8"} max-w-5xl mx-auto space-y-6`}>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            <span>Mon Profil</span>
          </TabsTrigger>
          <TabsTrigger value="parametres" className="gap-2">
            <Settings className="size-4" />
            <span>Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        {activeTab === "profile" && <ProfilePage embedded />}
        {activeTab === "parametres" && <ParametresPage embedded />}
        {activeTab === "notifications" && <NotificationsPage embedded />}
      </div>
    </div>
  );
}
