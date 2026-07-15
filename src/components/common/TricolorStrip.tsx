export function TricolorStrip({ height = 4 }: { height?: number }) {
  return (
    <div className="flex" style={{ height }}>
      <div className="flex-1 bg-primary" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-secondary" />
    </div>
  );
}
