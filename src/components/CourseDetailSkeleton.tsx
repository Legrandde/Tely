export default function CourseDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 animate-pulse">
      {/* Colonne gauche */}
      <div>
        {/* Badge Matière • Niveau */}
        <div className="h-6 bg-orange-100/70 rounded-full w-44" />

        {/* Titre */}
        <div className="space-y-2.5 mt-3">
          <div className="h-8 bg-gray-200 rounded-lg w-4/5" />
          <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
        </div>

        {/* Auteur */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-3.5 bg-gray-200 rounded w-28" />
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-8 border-b border-gray-200 mt-6 pb-3">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>

        {/* Contenu de l'onglet Énoncé */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-6 bg-gray-100 rounded-full w-56" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-11/12" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Sidebar droite */}
      <aside>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-6 bg-gray-200 rounded w-36" />
            <div className="h-6 bg-gray-100 rounded w-14 ml-auto" />
          </div>

          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <div className="h-3.5 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-3.5 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>

          <div className="h-10 bg-orange-100/70 rounded-lg mt-6 w-full" />

          <hr className="my-5 border-gray-200" />

          <div className="h-4 bg-gray-200 rounded w-40 mb-3" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 shrink-0" />
                <div className="h-3.5 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>

          <hr className="my-5 border-gray-200" />

          <div className="h-4 bg-gray-200 rounded w-36 mb-3" />
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200" />
            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200" />
            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200" />
          </div>
        </div>
      </aside>
    </div>
  );
}
