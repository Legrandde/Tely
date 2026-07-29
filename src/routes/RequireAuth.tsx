import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/authContext";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: Array<"eleve" | "professeur" | "administrateur">;
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Vérification des droits d'accès...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>
}
