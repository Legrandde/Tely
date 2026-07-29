export default function ExerciceCardSkeleton() {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-3/5 mb-3" />
      <div className="h-3 bg-gray-100 rounded-full w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded-full w-4/5 mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-8 bg-gray-100 rounded-lg w-full" />
    </div>
  );
}