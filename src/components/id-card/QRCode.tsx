"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeImg({ value, size = 90 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size * 3, margin: 1, color: { dark: "#0D1220", light: "#FFFFFF" } }).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) {
    return <div style={{ width: size, height: size, background: "#f2f2f2", borderRadius: 8 }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR" width={size} height={size} style={{ borderRadius: 8, background: "#fff" }} />;
}
