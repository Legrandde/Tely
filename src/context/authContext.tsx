import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAccess, clearAccess } from "../utils/storage";
import { getMe } from "../services/authService";

interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  avatar: string | null;
  role: "eleve" | "professeur" | "administrateur";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logoutLocal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = getAccess();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await getMe();
        setUser(me);
      } catch {
        // token invalide/expiré -> on nettoie
        clearAccess();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  function logoutLocal() {
    clearAccess();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, setUser, logoutLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}