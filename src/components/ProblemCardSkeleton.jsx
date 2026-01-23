export default function ProblemCardSkeleton() {
  return (
    <div className="group relative h-full rounded-xl border-2 border-[#e0d5c2] bg-white p-6 dark:border-[#3c3347] dark:bg-[#211d27]">
      {/* Header with number */}
      <div className="mb-4 flex items-start justify-between">
        <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
      </div>

      {/* Problem title */}
      <div className="mb-2">
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
      </div>

      {/* Problem ID */}
      <div className="mb-4 h-3 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />

      {/* Difficulty badge */}
      <div className="mb-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full" />
      </div>

      {/* Tags */}
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
      </div>

      {/* Stats section */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-[#f7f0e0] p-3 dark:bg-[#2d2535]">
        <div className="text-center">
          <div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mx-auto mb-1" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mx-auto" />
        </div>
        <div className="border-r border-l border-[#e0d5c2] dark:border-[#3c3347]"></div>
        <div className="text-center">
          <div className="h-4 w-6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mx-auto mb-1" />
          <div className="h-3 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mx-auto" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}