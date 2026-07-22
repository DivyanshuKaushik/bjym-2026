export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="h-[210px] animate-pulse rounded-2xl border border-border bg-white" />
      <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm font-bold text-muted">
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent align-[-3px]" />
        सदस्य लोड हो रहे हैं…
      </div>
    </div>
  );
}
