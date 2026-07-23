import "server-only";
import { db } from "@/lib/db/client";

export const PHOTO_BUCKET = "member-photos";

/** Hard ceiling matching the bucket's own `file_size_limit` (see
 *  000020_photo_storage.sql) — checked here too so a bad upload fails
 *  with a clear app-level error message instead of an opaque Storage
 *  API error. The client already compresses to WebP via canvas resize
 *  in PhotoCropper before this ever runs; this is a safety net, not the
 *  primary compression step (no server-side image library like `sharp`
 *  is introduced for this — see README for why). */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, contentType, base64] = match;
  return { buffer: Buffer.from(base64, "base64"), contentType };
}

/**
 * Uploads a member's cropped/compressed photo (a data: URL, as produced
 * by PhotoCropper) to Supabase Storage and returns the path + public URL
 * to save on the member row (`photo_storage_path` / `photo_url`).
 * Never touches `photo_base64` — that's the caller's choice, so existing
 * rows/flows relying on it are unaffected.
 */
export async function uploadMemberPhoto(dataUrl: string): Promise<{ path: string; url: string } | { error: string }> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { error: "अमान्य फोटो फॉर्मेट" };
  if (parsed.buffer.byteLength > MAX_PHOTO_BYTES) return { error: "फोटो का आकार बहुत बड़ा है" };

  const ext = parsed.contentType.split("/")[1] || "webp";
  const path = `members/${crypto.randomUUID()}.${ext}`;

  const { error } = await db().storage.from(PHOTO_BUCKET).upload(path, parsed.buffer, {
    contentType: parsed.contentType,
    upsert: false,
    cacheControl: "31536000", // 1 year — uploaded photos are immutable (replacing one uploads a new path and deletes the old, see deleteMemberPhoto)
  });
  if (error) return { error: `फोटो अपलोड करने में समस्या हुई: ${error.message}` };

  const { data } = db().storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Deletes a previously-uploaded photo — used when a member's photo is
 *  replaced (profile edit, re-registration) or when the standalone
 *  base64->Storage migration script clears an old base64 value only
 *  after confirming the new upload succeeded. Never throws — a failed
 *  delete of an orphaned object is a minor storage-cost issue, not
 *  worth failing the calling operation over. */
export async function deleteMemberPhoto(path: string | null): Promise<void> {
  if (!path) return;
  try {
    await db().storage.from(PHOTO_BUCKET).remove([path]);
  } catch {
    // best-effort — orphaned Storage objects can be cleaned up later via
    // a periodic sweep if this ever becomes a real cost concern.
  }
}
