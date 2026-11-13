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
      <div className="min-h-screen bg-gray-50 flex animate-pulse">
        {/* Sidebar skeleton */}
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 p-4 gap-6 shrink-0">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <div className="h-3.5 w-28 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </aside>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100" />
              <div className="w-9 h-9 rounded-full bg-gray-200" />
            </div>
          </header>
          <main className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-full bg-gray-50 rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isEnnonce = location.pathname.startsWith("/ennoncer");
    const raison = isEnnonce
      ? "Connectez-vous pour accéder à cet énoncé et à son corrigé."
      : "Veuillez vous connecter pour accéder à cette page.";

    return (
      <Navigate
        to="/auth/login"
        state={{ from: location, raison }}
        replace
      />
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>
}
