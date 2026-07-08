export default function SkeletonLoader({ count = 3, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card space-y-4">
            <div className="skeleton h-48 w-full rounded-xl" />
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
