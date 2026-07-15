export function Chakra({ size = 40, color = "#161A8D", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  const spokes = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    spokes.push(
      <line key={i} x1={50} y1={50} x2={50 + 42 * Math.cos(a)} y2={50 + 42 * Math.sin(a)} stroke={color} strokeWidth={2.5} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
      <circle cx={50} cy={50} r={46} fill="none" stroke={color} strokeWidth={5} />
      {spokes}
      <circle cx={50} cy={50} r={8} fill={color} />
    </svg>
  );
}
