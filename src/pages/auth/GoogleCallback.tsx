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
      navigate("/login?error=google_auth_failed", { replace: true });
      return;
    }

    setAccess(token);

    getMe()
      .then((user) => {
        if (user.role === "professeur") {
          navigate("/Dashboard-professeur", { replace: true });
        } else if (user.role === "administrateur") {
          navigate("/Dashbord-admin", { replace: true });
        } else {
          navigate("/exercices", { replace: true });
        }
      })
      .catch(() => {
        clearAccess();
        navigate("/login?error=google_auth_failed", { replace: true });
      });
  }, [params, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Connexion en cours...
    </div>
  );
}
