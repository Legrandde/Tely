import { Link, Outlet } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="bg-grid-pattern-subtle pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl tely-animate">
        <div className="mb-6 flex justify-center md:justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-2xs">
              T
            </span>
            <span className="tely-title text-lg tracking-tight">
              Tely Elearning<span className="text-amber-500">.</span>
            </span>
          </Link>
        </div>

        <Card className="flex flex-col md:flex-row w-full overflow-hidden p-0 gap-0 shadow-lg border-border/80 min-h-[32rem]">
          {/* Visuel gauche */}
          <div className="hidden md:block md:w-[44%] shrink-0 relative overflow-hidden bg-zinc-950">
            <img
              src="https://i.pinimg.com/736x/ae/c5/7c/aec57c021d6ffac7e28208c9599b61af.jpg"
              alt="Tely E-learning"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                Plateforme pédagogique
              </p>
              <p className="tely-title text-xl text-white leading-snug">
                Révisez efficacement avec des exercices et sujets corrigés.
              </p>
            </div>
          </div>

          {/* Formulaire (Outlet) */}
          <div className="flex-1 px-6 py-10 sm:px-10 md:px-12 flex flex-col justify-center bg-card">
            <Outlet />
          </div>
        </Card>
      </div>
    </div>
  );
}
