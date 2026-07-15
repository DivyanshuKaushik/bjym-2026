export function Avatar({
  name, photo, size = 64, ring = "#F36B21", square = false,
}: { name?: string; photo?: string | null; size?: number; ring?: string; square?: boolean }) {
  const initials = (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const radius = square ? 12 : "50%";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", border: `3px solid ${ring}`, background: "#fff", display: "block" }} />;
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, #F36B21, #D85A0B)`,
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size / 2.6, border: "3px solid #fff",
      }}
    >
      {initials}
    </div>
  );
}
