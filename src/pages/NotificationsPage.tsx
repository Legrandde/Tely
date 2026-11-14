import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  CheckCheck,
  RotateCw,
  Search,
  Filter,
  BookOpen,
  ClipboardList,
  UserCheck,
  ShieldAlert,
  Info,
  Clock,
  ArrowRight,
  Inbox,
  Check,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import type { AppNotification } from "../types/notification";
import { useToast } from "../context/ToastContext";

export default function NotificationsPage({ embedded = false }: { embedded?: boolean }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const dashboardPath = isProfesseur ? "/Dashboard-professeur" : "/Dashbord-admin";

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
      if (isManual) {
        toast.success("Notifications actualisées");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors du chargement des notifications";
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const runFetch = (isManual = false) => {
      fetchNotifications()
        .then((data) => {
          if (!cancelled) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
            if (isManual) {
              toast.success("Notifications actualisées");
            }
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            const msg =
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              "Erreur lors du chargement des notifications";
            toast.error(msg);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
            setRefreshing(false);
          }
        });
    };

    runFetch(false);
    const interval = setInterval(() => runFetch(false), 45000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [toast]);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      toast.success("Notification marquée comme lue");
    } catch {
      toast.error("Impossible de marquer la notification");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("Toutes les notifications sont marquées comme lues");
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const handleItemClick = async (item: AppNotification) => {
    if (!item.is_read) {
      await handleMarkAsRead(item.id);
    }
    if (item.lien) {
      navigate(item.lien);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "candidature":
        return <UserCheck size={18} className="text-gray-900" />;
      case "exercice":
        return <BookOpen size={18} className="text-gray-900" />;
      case "sujet":
        return <ClipboardList size={18} className="text-gray-900" />;
      case "securite":
        return <ShieldAlert size={18} className="text-gray-900" />;
      case "systeme":
      default:
        return <Info size={18} className="text-gray-900" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "candidature":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Candidature
          </span>
        );
      case "exercice":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Exercice
          </span>
        );
      case "sujet":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Sujet examen
          </span>
        );
      case "securite":
        return (
          <span className="tely-chip uppercase tracking-wide">
            Sécurité
          </span>
        );
      case "systeme":
      default:
        return (
          <span className="tely-chip uppercase tracking-wide">
            Système
          </span>
        );
    }
  };

  // Filtrage
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Statut
      if (filterStatus === "unread" && item.is_read) return false;
      if (filterStatus === "read" && !item.is_read) return false;

      // 2. Type
      if (filterType !== "all" && item.type !== filterType) return false;

      // 3. Recherche
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = item.titre?.toLowerCase().includes(query);
        const matchMsg = item.message?.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg) return false;
      }

      return true;
    });
  }, [notifications, filterStatus, filterType, search]);

  return (
    <div className="space-y-6">
      {/* ── Entête de la page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {!embedded && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Link to={dashboardPath} className="hover:underline">
                Tableau de bord
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Notifications</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="tely-h1">
              Centre de notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-900 text-white rounded-full">
                {unreadCount} non {unreadCount > 1 ? "lues" : "lue"}
              </span>
            )}
          </div>
          <p className="tely-subtitle mt-0.5">
            Suivez l'activité des épreuves, candidatures, alertes système et interactions en direct
          </p>
        </div>

        {/* Boutons d'actions globales */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="tely-btn-outline"
            title="Rafraîchir"
          >
            <RotateCw size={14} className={refreshing ? "text-gray-900 animate-pulse" : "text-gray-900"} />
            <span>Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="tely-btn"
          >
            <CheckCheck size={15} />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* ── Barre d'outils / Recherche & Filtres en pilule ── */}
      <div className="tely-card p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -trangray-y-1/2 text-gray-900" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans les notifications..."
              className="tely-input pl-9 pr-4"
            />
          </div>

          {/* Filtres de statut : Tous / Non lus / Lus */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-[10px] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("unread")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                filterStatus === "unread"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("read")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
                filterStatus === "read"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Lues ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200 text-xs">
          <span className="text-gray-400 mr-1 flex items-center gap-1">
            <Filter size={13} className="text-gray-900" />
            Catégories :
          </span>
          {[
            { key: "all", label: "Toutes" },
            { key: "candidature", label: "Candidatures" },
            { key: "exercice", label: "Exercices" },
            { key: "sujet", label: "Sujets Examens" },
            { key: "securite", label: "Sécurité" },
            { key: "systeme", label: "Système" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterType(cat.key)}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                filterType === cat.key
                  ? "bg-gray-900 text-white font-medium"
                  : "bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste des Notifications ── */}
      {loading ? (
        <div className="tely-card overflow-hidden divide-y divide-gray-100 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 sm:p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-gray-100 border border-gray-200/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className="h-4 w-16 bg-gray-100 rounded-md" />
                  </div>
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-gray-100 rounded" />
                  <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/80">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-6 w-28 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="tely-card p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 mx-auto mb-3">
            <Inbox size={28} />
          </div>
          <h3 className="tely-title text-lg mb-1">
            Aucune notification trouvée
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            {search || filterStatus !== "all" || filterType !== "all"
              ? "Aucune notification ne correspond à vos critères de filtrage."
              : "Vous êtes à jour ! Aucune nouvelle notification pour le moment."}
          </p>
        </div>
      ) : (
        <div className="tely-card overflow-hidden divide-y divide-gray-100">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !item.is_read
                  ? "bg-gray-50 hover:bg-gray-100/70"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Icône de type */}
              <div
                className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
                  !item.is_read
                    ? "bg-white border-gray-900"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {getNotificationIcon(item.type)}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {item.titre}
                    </span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gray-900" title="Non lue" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getNotificationBadge(item.type)}
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock size={12} className="text-gray-900" />
                      {item.time_ago}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2.5">
                  {item.message}
                </p>

                {/* Barre d'action inférieure de la carte */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  {item.lien ? (
                    <span className="inline-flex items-center gap-1 tely-link">
                      Voir le détail
                      <ArrowRight size={13} className="text-gray-900" />
                    </span>
                  ) : (
                    <span className="text-gray-400 text-[11px]">Information système</span>
                  )}

                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-[10px] px-2.5 py-1 transition-colors"
                    >
                      <Check size={12} className="text-gray-900" />
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
