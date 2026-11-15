import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  erreur: Error | null;
}

/** Capture les erreurs de rendu et affiche un écran de secours propre. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { erreur: null };

  static getDerivedStateFromError(erreur: Error): State {
    return { erreur };
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", erreur, info.componentStack);
    }
  }

  render() {
    if (!this.state.erreur) return this.props.children;

    return (
      <main
        role="alert"
        className="tely-page flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="tely-card w-full max-w-md p-8">
          <p className="text-4xl font-extrabold text-amber-500" aria-hidden="true">
            Oups
          </p>
          <h1 className="tely-title mt-3 text-xl">Une erreur inattendue est survenue</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pas d'inquiétude, vos données ne sont pas perdues. Rechargez la page pour continuer.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => window.location.reload()} className="tely-btn">
              <RefreshCw size={16} aria-hidden="true" />
              Recharger la page
            </button>
            <a href="/" className="tely-btn-outline">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </main>
    );
  }
}
