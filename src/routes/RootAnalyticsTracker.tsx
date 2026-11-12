import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { trackEvent } from "../services/analyticsTracker";

export default function RootAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", location.pathname);
  }, [location.pathname]);

  return <Outlet />;
}
