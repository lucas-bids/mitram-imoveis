export function PropertyFormSkeleton() {
  return (
    <div className="pb-12">
      <div className="mb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className="rounded-xl border-2 border-gray-100 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
