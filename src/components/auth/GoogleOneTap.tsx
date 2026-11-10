import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/ToastContext";
import { loginWithGoogleOneTap } from "../../services/authService";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const { isAuthenticated, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) return;
    if (initializedRef.current) return;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "839117011473-4ihglsfe6d452oi0tfkfks4d9frko76g.apps.googleusercontent.com";

    const initOneTap = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) return;
            try {
              const loggedUser = await loginWithGoogleOneTap(response.credential);
              setUser(loggedUser);
              addToast("success", `Connexion réussie ! Bienvenue ${loggedUser.prenom || loggedUser.nom}.`);

              if (loggedUser.role === "administrateur") {
                navigate("/Dashbord-admin/overview");
              } else if (loggedUser.role === "professeur") {
                navigate("/Dashboard-professeur/overview");
              } else {
                navigate("/Exercices");
              }
            } catch (err: unknown) {
              console.error("Google One Tap error:", err);
              addToast("error", "Impossible de vous connecter avec Google One Tap.");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.prompt();
        initializedRef.current = true;
      } catch (e) {
        console.warn("Google One Tap initialize error:", e);
      }
    };

    // If script not loaded, load it dynamically
    if (!window.google?.accounts?.id) {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initOneTap;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initOneTap);
      }
    } else {
      initOneTap();
    }
  }, [isAuthenticated, setUser, addToast, navigate]);

  return null;
}
