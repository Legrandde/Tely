/** Squelette court affiché pendant la résolution de la page d'accueil (CMS ou défaut). */
export default function LandingSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:pt-16"
      aria-busy="true"
      aria-label="Chargement de la page"
    >
      <div className="space-y-5">
        <div className="h-7 w-56 animate-pulse rounded-full bg-amber-200/60" />
        <div className="space-y-3">
          <div className="h-11 w-full max-w-lg animate-pulse rounded-lg bg-amber-200/60" />
          <div className="h-11 w-4/5 max-w-md animate-pulse rounded-lg bg-amber-200/60" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-amber-100" />
          <div className="h-4 w-11/12 max-w-lg animate-pulse rounded bg-amber-100" />
          <div className="h-4 w-2/3 max-w-md animate-pulse rounded bg-amber-100" />
        </div>
        <div className="flex gap-3 pt-3">
          <div className="h-14 w-48 animate-pulse rounded-xl bg-amber-300/60" />
          <div className="h-14 w-40 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
      <div className="mx-auto aspect-square w-full max-w-[22rem] animate-pulse rounded-[2rem] bg-amber-100 sm:max-w-md lg:max-w-none" />
    </div>
  );
}
