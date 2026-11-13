export default function ExerciceCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse">
      {/* Vignette */}
      <div className="relative h-36 w-full flex flex-col items-center justify-center gap-2 bg-gray-200 px-4">
        <span className="absolute top-2 right-2 h-4 w-16 bg-white/80 rounded-full" />
        <div className="h-4 bg-white/70 rounded-full w-3/4" />
        <div className="h-4 bg-white/60 rounded-full w-1/2" />
      </div>

      {/* Contenu */}
      <div className="flex flex-col p-3 gap-1.5">
        <div className="h-3 bg-gray-100 rounded-full w-24" />
        <div className="space-y-1.5 mt-0.5">
          <div className="h-3.5 bg-gray-200 rounded-full w-full" />
          <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
        </div>

        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-gray-200" />
            <div className="h-3 bg-gray-100 rounded-full w-14" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-gray-200" />
            <div className="h-3 bg-gray-100 rounded-full w-12" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="h-5 bg-gray-100 rounded-full w-14" />
          <div className="h-3.5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
