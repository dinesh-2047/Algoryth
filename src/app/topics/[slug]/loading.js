export default function Loading() {
  return (
    <section className="grid gap-6">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}