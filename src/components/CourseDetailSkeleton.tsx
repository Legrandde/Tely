export default function CourseDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 animate-pulse">
      {/* Colonne gauche */}
      <div>
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-4/5 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-gray-200" />
          <div>
            <div className="h-3 bg-gray-100 rounded w-16 mb-1.5" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>

        <div className="flex gap-8 border-b border-gray-200 pb-3 mb-6">
          <div className="h-3 bg-gray-200 rounded w-14" />
          <div className="h-3 bg-gray-200 rounded w-14" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-5" />
          <div className="h-3 bg-gray-100 rounded w-full mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-3" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>

      {/* Sidebar droite */}
      <aside>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 bg-gray-200 rounded w-28" />
            <div className="h-5 bg-gray-100 rounded w-14 ml-auto" />
          </div>

          <div className="space-y-3 mb-6">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>

          <div className="h-10 bg-gray-200 rounded-lg mb-5" />
          <hr className="my-5 border-gray-200" />

          <div className="h-3 bg-gray-100 rounded w-32 mb-3" />
          <div className="space-y-2.5">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </aside>
    </div>
  );
}