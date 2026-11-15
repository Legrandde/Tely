import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/authContext";
import { cheminApresConnexion, extraireCheminFrom } from "../services/authService";

interface RequireGuestProps {
  children: ReactNode;
}

export function RequireGuest({ children }: RequireGuestProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user) {
    // Même destination que les formulaires de connexion : pas de conflit de redirection
    return <Navigate to={cheminApresConnexion(user, extraireCheminFrom(location.state))} replace />;
  }

  return <>{children}</>;
}
