import { useSyncExternalStore, type ReactNode } from "react";
import { Loader2, Mail, Wrench } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSite, useSiteNom } from "../../context/SiteContext";

/** Sous-ensemble du routeur data de react-router utilisé ici (le gate est rendu hors du RouterProvider). */
interface RouterLike {
  state: { location: { pathname: string } };
  subscribe: (fn: (state: { location: { pathname: string } }) => void) => () => void;
  navigate: (to: string) => unknown;
}

interface MaintenanceGateProps {
  router: RouterLike;
  children: ReactNode;
}

/**
 * Si `mode_maintenance === "1"`, affiche une page de maintenance aux non-administrateurs.
 * Les routes `/auth/*` restent accessibles pour que l'administrateur puisse se connecter.
 */
export default function MaintenanceGate({ router, children }: MaintenanceGateProps) {
  const { parametres } = useSite();
  const { user, isLoading } = useAuth();
  const siteNom = useSiteNom();

  const pathname = useSyncExternalStore(
    (cb) => router.subscribe(() => cb()),
    () => router.state.location.pathname,
    () => "/"
  );

  const maintenance = parametres?.mode_maintenance === "1";
  if (!maintenance) return <>{children}</>;

  const estAuth = /^\/auth(\/|$)/i.test(pathname);
  if (estAuth) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="tely-page flex min-h-screen items-center justify-center" aria-busy="true">
        <Loader2 className="animate-spin text-amber-500" size={28} aria-label="Chargement" />
      </div>
    );
  }

  if (user?.role === "administrateur") {
    return (
      <>
        <div
          role="status"
          className="fixed bottom-3 right-3 z-[65] flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg"
        >
          <Wrench size={12} className="text-amber-400" aria-hidden="true" />
          Mode maintenance actif — visible par vous seul
        </div>
        {children}
      </>
    );
  }

  const message =
    parametres?.message_maintenance?.trim() ||
    "Nous améliorons la plateforme pour vous offrir une meilleure expérience. Merci de revenir dans quelques instants.";
  const email = parametres?.contact_email?.trim();

  return (
    <main className="tely-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <div className="bg-grid-dots pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-lg">
        <p className="text-lg font-extrabold tracking-tight text-gray-900">
          {siteNom}
          <span className="text-amber-500">.</span>
        </p>
        <div className="tely-card mt-6 px-6 py-10 sm:px-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Wrench size={26} aria-hidden="true" />
          </span>
          <h1 className="tely-title mt-5 text-2xl sm:text-3xl">Maintenance en cours</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 sm:text-base">
            {message}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => window.location.reload()} className="tely-btn">
              Réessayer
            </button>
            {email && (
              <a href={`mailto:${email}`} className="tely-btn-outline">
                <Mail size={16} aria-hidden="true" />
                Nous écrire
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.navigate("/auth/login")}
          className="mt-6 text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900"
        >
          Accès administrateur
        </button>
      </div>
    </main>
  );
}
