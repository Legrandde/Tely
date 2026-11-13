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

export default function NotificationsPage() {
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
        return <UserCheck size={18} className="text-blue-600" />;
      case "exercice":
        return <BookOpen size={18} className="text-amber-600" />;
      case "sujet":
        return <ClipboardList size={18} className="text-purple-600" />;
      case "securite":
        return <ShieldAlert size={18} className="text-rose-600" />;
      case "systeme":
      default:
        return <Info size={18} className="text-slate-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "candidature":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            Candidature
          </span>
        );
      case "exercice":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Exercice
          </span>
        );
      case "sujet":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
            Sujet examen
          </span>
        );
      case "securite":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            Sécurité
          </span>
        );
      case "systeme":
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
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
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to={dashboardPath} className="hover:underline">
              Tableau de bord
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Notifications</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Centre de notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                {unreadCount} non {unreadCount > 1 ? "lues" : "lue"}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivez l'activité des épreuves, candidatures, alertes système et interactions en direct
          </p>
        </div>

        {/* Boutons d'actions globales */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Rafraîchir"
          >
            <RotateCw size={14} className={refreshing ? "text-amber-500 animate-pulse" : ""} />
            <span>Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCheck size={15} className="text-emerald-500" />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* ── Barre d'outils / Recherche & Filtres en pilule ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans les notifications..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtres de statut : Tous / Non lus / Lus */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("unread")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterStatus === "unread"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("read")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterStatus === "read"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Lues ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={13} />
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
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste des Notifications ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 sm:p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-44 bg-slate-200 rounded" />
                    <div className="w-2 h-2 rounded-full bg-amber-200" />
                    <div className="h-4 w-16 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                  <div className="h-3 w-24 bg-amber-100/80 rounded" />
                  <div className="h-6 w-28 bg-slate-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Aucune notification trouvée
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {search || filterStatus !== "all" || filterType !== "all"
              ? "Aucune notification ne correspond à vos critères de filtrage."
              : "Vous êtes à jour ! Aucune nouvelle notification pour le moment."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !item.is_read
                  ? "bg-amber-50/40 hover:bg-amber-50/70"
                  : "hover:bg-slate-50/80"
              }`}
            >
              {/* Icône de type */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  !item.is_read
                    ? "bg-white border-amber-200 shadow-2xs"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {getNotificationIcon(item.type)}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {item.titre}
                    </span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Non lue" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getNotificationBadge(item.type)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      {item.time_ago}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2.5">
                  {item.message}
                </p>

                {/* Barre d'action inférieure de la carte */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  {item.lien ? (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-600 hover:text-amber-700">
                      Voir le détail
                      <ArrowRight size={13} />
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Information système</span>
                  )}

                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 transition-colors shadow-2xs"
                    >
                      <Check size={12} className="text-emerald-500" />
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
