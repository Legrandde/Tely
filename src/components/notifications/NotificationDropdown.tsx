import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  GraduationCap,
  BookOpen,
  FileText,
  ShieldAlert,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";
import type { AppNotification } from "../../types/notification";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Ignoré si déconnecté ou erreur silencieuse
    }
  };

  useEffect(() => {
    loadData();
    // Rafraîchir toutes les 45 secondes pour le temps réel
    const interval = setInterval(loadData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      loadData();
    }
  };

  const handleItemClick = async (item: AppNotification) => {
    if (!item.is_read) {
      try {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Continue navigation
      }
    }

    if (item.lien) {
      setOpen(false);
      navigate(item.lien);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "candidature":
        return <GraduationCap size={15} className="text-amber-600" />;
      case "exercice":
        return <BookOpen size={15} className="text-blue-600" />;
      case "ressource":
      case "sujet":
        return <FileText size={15} className="text-emerald-600" />;
      case "securite":
        return <ShieldAlert size={15} className="text-rose-600" />;
      default:
        return <Info size={15} className="text-amber-500" />;
    }
  };

  const displayedList =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        type="button"
        onClick={handleToggle}
        title="Notifications"
        className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer relative ${
          open
            ? "bg-amber-100 text-amber-700"
            : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
        }`}
        aria-label="Voir les notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panneau Notifications */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {unreadCount} nouvelle(s)
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Marquer tout comme lu"
              >
                <CheckCheck size={13} />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Filtres : Toutes / Non lues */}
          <div className="flex items-center gap-2 px-3.5 py-2 border-b border-gray-100 bg-gray-50/50 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
            {displayedList.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2">
                  <Bell size={18} />
                </div>
                <p className="text-xs font-semibold text-gray-700">Aucune notification</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {filter === "unread"
                    ? "Toutes vos notifications sont lues !"
                    : "Vous serez averti dès qu'une activité aura lieu."}
                </p>
              </div>
            ) : (
              displayedList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-amber-50/40 relative ${
                    !item.is_read ? "bg-amber-50/20" : ""
                  }`}
                >
                  {/* Pastille non lue */}
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-4 left-2" />
                  )}

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  {/* Text Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.titre}
                      </p>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0 font-medium">
                        <Clock size={10} />
                        {item.time_ago}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.lien && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-700 mt-1.5">
                        Consulter <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
