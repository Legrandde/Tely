import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { trackEvent } from "../services/analyticsTracker";

export default function RootAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", location.pathname);

    // Actions métier déduites de la page consultée
    const id = new URLSearchParams(location.search).get("id");
    const path = location.pathname.toLowerCase();
    if (path === "/ennoncer" && id) {
      trackEvent("view_exercice", location.pathname, { id });
    } else if (path === "/ennoncer-sujet" && id) {
      trackEvent("view_sujet", location.pathname, { id });
    }
  }, [location.pathname, location.search]);

  return <Outlet />;
}
