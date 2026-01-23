export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid h-[600px] grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-[#fff8ed] p-5">
          <div className="border-b pb-4">
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-2" />
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-2" />
            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </div>
        </div>
        <div className="rounded-2xl border">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-t-2xl" />
          <div className="h-[592px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}