import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { trackEvent } from "../services/analyticsTracker";
import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from "../components/site/consent";

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

  // La page affichée au moment du consentement est comptée dès l'acceptation
  useEffect(() => {
    const surConsentement = () => {
      if (hasAnalyticsConsent()) trackEvent("page_view", window.location.pathname);
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, surConsentement);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, surConsentement);
  }, []);

  return <Outlet />;
}
