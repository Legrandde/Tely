import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchNotifications } from "../../services/notificationService";

export default function NotificationDropdown() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isProfesseur = location.pathname.toLowerCase().includes("professeur");
  const targetPath = isProfesseur
    ? "/Dashboard-professeur/notifications"
    : "/Dashbord-admin/notifications";

  useEffect(() => {
    let cancelled = false;

    const loadData = () => {
      fetchNotifications()
        .then((data) => {
          if (!cancelled) setUnreadCount(data.unread_count || 0);
        })
        .catch(() => {
          // Ignoré si déconnecté
        });
    };

    loadData();
    const interval = setInterval(loadData, 45000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    navigate(targetPath);
  };

  const isActive = location.pathname.toLowerCase().includes("notifications");

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        unreadCount > 0
          ? `Centre de notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`
          : "Centre de notifications"
      }
      className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer relative ${
        isActive
          ? "bg-amber-100 text-amber-700"
          : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
      }`}
      aria-label="Accéder au centre de notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse shadow-xs">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
