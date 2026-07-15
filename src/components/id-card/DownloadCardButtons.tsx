"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

export function DownloadCardButtons({
  cardRef,
  fileName,
  labels,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  fileName: string;
  labels: { png: string; pdf: string };
}) {
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  const getPngDataUrl = async () => {
    if (!cardRef.current) return null;
    // Render at 3x scale for a crisp, print-quality download.
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
  };

  const downloadPng = async () => {
    setBusy("png");
    try {
      const dataUrl = await getPngDataUrl();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${fileName}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async () => {
    setBusy("pdf");
    try {
      const dataUrl = await getPngDataUrl();
      if (!dataUrl || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [rect.width, rect.height],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, rect.width, rect.height);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Button onClick={downloadPng} disabled={busy !== null}>
        {busy === "png" ? "…" : `⬇ ${labels.png}`}
      </Button>
      <Button variant="navy" onClick={downloadPdf} disabled={busy !== null}>
        {busy === "pdf" ? "…" : `📄 ${labels.pdf}`}
      </Button>
    </div>
  );
}
