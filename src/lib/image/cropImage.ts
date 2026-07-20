export type CroppedAreaPixels = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotatedSize(width: number, height: number, rotation: number) {
  const r = toRadians(rotation);
  return {
    width: Math.abs(Math.cos(r) * width) + Math.abs(Math.sin(r) * height),
    height: Math.abs(Math.sin(r) * width) + Math.abs(Math.cos(r) * height),
  };
}

/**
 * Crops the given image to `pixelCrop`, applies `rotation`, then resizes the
 * result to a FIXED output size (`outW` x `outH`, passport ratio 3:4 by
 * default) so every member's ID card photo has identical dimensions.
 * Returns a compressed WebP data URL.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  rotation = 0,
  outW = 480,
  outH = 640,
  quality = 0.88
): Promise<string> {
  const image = await createImage(imageSrc);

  const rotCanvas = document.createElement("canvas");
  const rotCtx = rotCanvas.getContext("2d")!;
  const { width: rW, height: rH } = rotatedSize(image.width, image.height, rotation);
  rotCanvas.width = rW;
  rotCanvas.height = rH;
  rotCtx.translate(rW / 2, rH / 2);
  rotCtx.rotate(toRadians(rotation));
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(rotCanvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);

  return outCanvas.toDataURL("image/webp", quality);
}
