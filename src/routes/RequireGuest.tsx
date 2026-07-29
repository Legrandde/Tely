import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/authContext";

interface RequireGuestProps {
  children: ReactNode;
}

export function RequireGuest({ children }: RequireGuestProps) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "professeur") return <Navigate to="/professeur/dashboard" replace />;
    if (user?.role === "administrateur") return <Navigate to="/Dashbord-admin" replace />;
    return <Navigate to="/Exercices" replace />;
  }

  return <>{children}</>;
}