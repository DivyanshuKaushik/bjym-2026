"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg, type CroppedAreaPixels } from "@/lib/image/cropImage";
import { Button } from "@/components/ui/button";

const PASSPORT_ASPECT = 3 / 4;

export function PhotoCropper({
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
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      onError("कृपया एक image file चुनें / Please select an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError("Photo 8 MB से कम होनी चाहिए");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => setCroppedAreaPixels(pixels), []);

  const applyCrop = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const result = await getCroppedImg(rawImage, croppedAreaPixels, rotation);
      onPhoto(result);
      setRawImage(null);
    } catch {
      onError("Photo process करने में त्रुटि हुई, दोबारा कोशिश करें");
    } finally {
      setBusy(false);
    }
  };

  if (rawImage) {
    return (
      <div className="grid gap-3 rounded-2xl border border-border bg-[#FFFDFB] p-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black/80">
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={PASSPORT_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-bold text-heading">
            Zoom
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-1 w-full accent-primary" />
          </label>
          <label className="text-xs font-bold text-heading">
            Rotate
            <input type="range" min={-45} max={45} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="mt-1 w-full accent-primary" />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setRawImage(null)}>रद्द करें</Button>
          <Button type="button" size="sm" onClick={applyCrop} disabled={busy}>{busy ? "…" : "Crop लागू करें ✓"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-[#FFFDFB] p-5 text-center"
        style={error ? { borderColor: "#DC2626" } : undefined}
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="preview" className="h-24 w-[72px] rounded-lg border-[3px] border-primary object-cover" />
            <div className="text-left">
              <div className="text-[13.5px] font-extrabold text-secondary-dark">Photo ready ✓</div>
              <div className="text-xs text-muted">बदलने के लिए click करें</div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-2xl">📷</div>
            <div className="text-[13.5px] font-extrabold text-heading">पासपोर्ट साइज फोटो अपलोड करें।</div>
            <div className="text-xs text-muted">फोटो चुनें, फिर क्रॉप, ज़ूम एवं रोटेट करें</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
      {error && <div className="mt-1 text-[11.5px] font-bold text-danger">{error}</div>}
    </div>
  );
}
