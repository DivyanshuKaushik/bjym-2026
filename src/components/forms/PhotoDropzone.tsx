"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PhotoDropzone({
  photo,
  onPhoto,
  error,
  onError,
}: {
  photo: string | null;
  onPhoto: (dataUrl: string) => void;
  error?: string;
  onError: (msg: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      onError("कृपया एक image file चुनें / Please select an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      onError("Photo 4 MB से कम होनी चाहिए / Photo must be under 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const cv = document.createElement("canvas");
        cv.width = 400;
        cv.height = 400;
        const ctx = cv.getContext("2d")!;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400);
        onPhoto(cv.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          process(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
          drag ? "border-primary bg-primary-light" : error ? "border-danger" : "border-border bg-[#FFFDFB]"
        )}
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="preview" className="h-20 w-20 rounded-xl border-[3px] border-primary object-cover" />
            <div className="text-left">
              <div className="text-[13.5px] font-extrabold text-secondary-dark">Photo added ✓ (auto-cropped)</div>
              <div className="text-xs text-muted">बदलने के लिए click करें या नई photo drop करें</div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-2xl">📷</div>
            <div className="text-[13.5px] font-extrabold text-heading">Passport size photo यहाँ drop करें</div>
            <div className="text-xs text-muted">या click करके browse करें · max 4 MB · auto-crop होगी</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => process(e.target.files?.[0])} />
      {error && <div className="mt-1 text-[11.5px] font-bold text-danger">{error}</div>}
    </div>
  );
}
