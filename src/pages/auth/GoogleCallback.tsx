import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccess, clearAccess } from "../../utils/storage";
import { getMe, cheminApresConnexion, codeErreurApi, verifierNonceGoogle } from "../../services/authService";
import { cheminInterneSur } from "../../utils/liens";
import { useAuth } from "../../context/authContext";

export function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  // Le callback ne doit être traité qu'une fois (StrictMode rejoue les effets en dev)
  const traiteRef = useRef(false);

  useEffect(() => {
    if (traiteRef.current) return;
    traiteRef.current = true;
    // Le jeton n'est accepté que dans le fragment (#token=), jamais en query string (logs, Referer)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    const tokenRecu = hashParams.get("token");
    // Le retour doit porter le nonce de la connexion lancée dans CET onglet (anti « login CSRF »)
    const nonceValide = verifierNonceGoogle(hashParams.get("state"));
    const token = tokenRecu && nonceValide ? tokenRecu : null;

    // Nettoyage immédiat de l'URL pour ne pas laisser le token dans l'historique du navigateur
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Le backend peut rediriger ici avec une erreur (ex. compte suspendu)
    const erreur = hashParams.get("erreur") || params.get("erreur");
    if (erreur === "compte_suspendu" || erreur === "inscriptions_fermees") {
      navigate(`/auth/login?erreur=${erreur}`, { replace: true });
      return;
    }

    if (!token) {
      navigate("/auth/login?error=google_auth_failed", { replace: true });
      return;
    }

    setAccess(token);

    getMe()
      .then((user) => {
        const redirectPath = sessionStorage.getItem("auth_redirect");
        sessionStorage.removeItem("auth_redirect");
        // Contexte mis à jour avant la navigation pour que RequireAuth voie l'utilisateur
        flushSync(() => setUser(user));
        navigate(cheminApresConnexion(user, cheminInterneSur(redirectPath) ? redirectPath : null), {
          replace: true,
        });
      })
      .catch((err: unknown) => {
        clearAccess();
        const code = codeErreurApi(err);
        navigate(
          code === "compte_suspendu" ? "/auth/login?erreur=compte_suspendu" : "/auth/login?error=google_auth_failed",
          { replace: true }
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
