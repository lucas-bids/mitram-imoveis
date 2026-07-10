export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-mitram-grayLight">
      <div className="bg-white shadow-sm sticky top-[72px] z-40 border-t h-20 animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <div className="h-64 bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-4 animate-pulse border-t pt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
