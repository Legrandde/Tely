import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccess, clearAccess } from "../../utils/storage";
import { getMe } from "../../services/authService";

export function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login?error=google_auth_failed", { replace: true });
      return;
    }

    setAccess(token);

    getMe()
      .then((user) => {
        if (user.role === "professeur") {
          navigate("/professeur/dashboard", { replace: true });
        } else if (user.role === "administrateur") {
          navigate("/dashbord-admin", { replace: true });
        } else {
          // eleve
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