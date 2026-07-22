export default function Loading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[220px] animate-pulse rounded-2xl border border-border bg-white" />
      ))}
    </div>
  );
}
