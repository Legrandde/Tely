import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Stockage global pour ne pas manquer l'événement beforeinstallprompt si le composant monte tardivement.
let evenementDiffere: BeforeInstallPromptEvent | null = null;
const abonnes = new Set<() => void>();

function notifier() {
  abonnes.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    evenementDiffere = e as BeforeInstallPromptEvent;
    notifier();
  });

  window.addEventListener("appinstalled", () => {
    evenementDiffere = null;
    notifier();
  });
}

function estEnModeStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function estIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const autreNavigateur = /CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return ios && webkit && !autreNavigateur;
}

export function usePwaInstall() {
  const [, setTick] = useState(0);
  const [installe, setInstalle] = useState(() => estEnModeStandalone());
  const isIos = estIosSafari();

  useEffect(() => {
    const onUpdate = () => setTick((t) => t + 1);
    const onInstalled = () => setInstalle(true);
    abonnes.add(onUpdate);
    window.addEventListener("appinstalled", onInstalled);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => setInstalle(e.matches);
    mq.addEventListener?.("change", onDisplayChange);

    return () => {
      abonnes.delete(onUpdate);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!evenementDiffere) return "unavailable";
    const ev = evenementDiffere;
    await ev.prompt();
    const choice = await ev.userChoice;
    if (choice.outcome === "accepted") {
      evenementDiffere = null;
      setInstalle(true);
      notifier();
    }
    return choice.outcome;
  }, []);

  return {
    canInstall: !installe && !!evenementDiffere,
    isIosInstallable: !installe && isIos && !evenementDiffere,
    isInstalled: installe,
    promptInstall,
  };
}
