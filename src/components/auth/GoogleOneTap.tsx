import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useToast } from "../../context/ToastContext";
import {
  loginWithGoogleOneTap,
  cheminApresConnexion,
  codeErreurApi,
  extraireCheminFrom,
} from "../../services/authService";

interface GooglePromptMomentNotification {
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string;
}

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
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: GooglePromptMomentNotification) => void) => void;
          cancel: () => void;
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
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = useRef(false);
  // Page d'origine (state.from) lue au moment du callback, sans relancer l'initialisation
  const fromRef = useRef<string | null>(null);
  useEffect(() => {
    fromRef.current = extraireCheminFrom(location.state);
  }, [location.state]);

  useEffect(() => {
    // Attend la fin de la vérification de session avant d'afficher One Tap
    if (isLoading || isAuthenticated) return;
    if (initializedRef.current) return;

    const clientId = (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "839117011473-4ihglsfe6d452oi0tfkfks4d9frko76g.apps.googleusercontent.com"
    ).trim();

    if (!clientId) return;

    let annule = false;

    const initOneTap = () => {
      if (annule || initializedRef.current || !window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) return;
            try {
              const loggedUser = await loginWithGoogleOneTap(response.credential);
              flushSync(() => setUser(loggedUser));
              addToast("success", `Connexion réussie ! Bienvenue ${loggedUser.prenom || loggedUser.nom}.`);
              navigate(cheminApresConnexion(loggedUser, fromRef.current), { replace: true });
            } catch (err: unknown) {
              console.error("Google One Tap error:", err);
              const code = codeErreurApi(err);
              if (code === "compte_suspendu") {
                addToast("error", "Votre compte a été suspendu. Contactez l'équipe Tely.");
              } else if (code === "inscriptions_fermees") {
                addToast("warning", "Les inscriptions sont momentanément fermées.");
              } else {
                addToast("error", "Impossible de vous connecter avec Google One Tap.");
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        window.google.accounts.id.prompt((notification) => {
          if (import.meta.env.DEV) {
            if (notification.isNotDisplayed?.()) {
              console.warn("Google One Tap non affiché :", notification.getNotDisplayedReason?.());
            } else if (notification.isSkippedMoment?.()) {
              console.warn("Google One Tap ignoré :", notification.getSkippedReason?.());
            }
          }
        });
        initializedRef.current = true;
      } catch (e) {
        console.warn("Google One Tap initialize error:", e);
      }
    };

    let existingScript = document.getElementById("google-gsi-script") as HTMLScriptElement | null;
    if (!window.google?.accounts?.id) {
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", initOneTap);
        document.head.appendChild(script);
        existingScript = script;
      } else {
        existingScript.addEventListener("load", initOneTap);
      }
    } else {
      initOneTap();
    }

    return () => {
      annule = true;
      existingScript?.removeEventListener("load", initOneTap);
      if (initializedRef.current) {
        try {
          window.google?.accounts?.id?.cancel();
        } catch {
          // ignore
        }
        initializedRef.current = false;
      }
    };
  }, [isLoading, isAuthenticated, setUser, addToast, navigate]);

  return null;
}
