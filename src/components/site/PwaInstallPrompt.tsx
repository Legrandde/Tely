import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelyMark } from "@/components/ui/BrandLogo";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const CLE_REFUS = "tely.pwa.dismissed_at";
const DUREE_MASQUAGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function estMasqueRecemment(): boolean {
  try {
    const raw = localStorage.getItem(CLE_REFUS);
    if (!raw) return false;
    return Date.now() - Number(raw) < DUREE_MASQUAGE_MS;
  } catch {
    return false;
  }
}

/**
 * Invite discrète d'installation PWA affichée une fois sur le site
 * (Android / Chrome / Edge via beforeinstallprompt, et guide rapide sur iOS Safari).
 */
export default function PwaInstallPrompt() {
  const { canInstall, isIosInstallable, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    if (estMasqueRecemment()) return;
    const t = window.setTimeout(() => setPret(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (pret && (canInstall || isIosInstallable) && !estMasqueRecemment()) {
      setVisible(true);
    }
  }, [pret, canInstall, isIosInstallable]);

  if (!visible || (!canInstall && !isIosInstallable)) return null;

  const fermer = () => {
    setVisible(false);
    try {
      localStorage.setItem(CLE_REFUS, String(Date.now()));
    } catch {
      // ignore storage errors
    }
  };

  const installer = async () => {
    const res = await promptInstall();
    if (res === "accepted") {
      setVisible(false);
    }
  };

  return (
    <aside
      role="region"
      aria-label="Installer l'application Tely"
      className="fixed bottom-4 right-4 left-4 z-50 mx-auto max-w-sm sm:left-auto sm:mx-0"
    >
      <div className="relative flex items-start gap-3.5 rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-xl backdrop-blur-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
          <TelyMark className="h-6" />
        </div>

        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-semibold text-foreground">Installer Tely</p>
          {canInstall ? (
            <>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Accédez à vos exercices et sujets d'examen directement depuis votre écran d'accueil.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button type="button" variant="brand" size="sm" onClick={installer}>
                  <Download className="size-3.5" aria-hidden="true" />
                  Installer l'app
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={fermer}>
                  Plus tard
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Appuyez sur{" "}
              <Share className="mx-0.5 inline size-3.5 align-text-bottom text-foreground" aria-hidden="true" />{" "}
              <span className="font-medium text-foreground">Partager</span> puis sur{" "}
              <span className="font-medium text-foreground">« Sur l'écran d'accueil »</span>.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer l'invitation d'installation"
          className="absolute right-2.5 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
