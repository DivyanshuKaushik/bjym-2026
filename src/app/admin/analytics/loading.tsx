export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[260px] animate-pulse rounded-2xl border border-border bg-white" />
      ))}
    </div>
  );
}
