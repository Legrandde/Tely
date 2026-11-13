import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccess, clearAccess } from "../../utils/storage";
import { getMe } from "../../services/authService";

export function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Lecture sécurisée du token depuis le fragment hash (#token=) ou query (?token=)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    const token = hashParams.get("token") || params.get("token");

    // Nettoyage immédiat de l'URL pour ne pas laisser le token dans l'historique du navigateur
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (!token) {
      navigate("/auth/login?error=google_auth_failed", { replace: true });
      return;
    }

    setAccess(token);

    getMe()
      .then((user) => {
        if (user.role === "professeur") {
          sessionStorage.removeItem("auth_redirect");
          navigate("/Dashboard-professeur", { replace: true });
          return;
        }

        if (user.role === "administrateur") {
          sessionStorage.removeItem("auth_redirect");
          navigate("/Dashbord-admin", { replace: true });
          return;
        }

        const redirectPath = sessionStorage.getItem("auth_redirect");
        if (redirectPath) {
          sessionStorage.removeItem("auth_redirect");
          navigate(redirectPath, { replace: true });
          return;
        }

        navigate("/exercices", { replace: true });
      })
      .catch(() => {
        clearAccess();
        navigate("/auth/login?error=google_auth_failed", { replace: true });
      });
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 px-8 pt-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white rounded-2xl border border-gray-100 px-6 flex items-center justify-between mb-8">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="hidden md:flex items-center gap-6">
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="h-36 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-8 w-full bg-gray-50 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
