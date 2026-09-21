import { resizeImage } from "../../utils/resizeImage";

// Optional photographs the doctor can attach to an examination form. They print
// on a second page, and only when at least one has been added.

export interface ExamPhoto {
  id: string;
  src: string; // data URL, so nothing has to be uploaded anywhere
  caption: string;
}

export const MAX_EXAM_PHOTOS = 12;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export type PhotoRejection = "type" | "size";

export async function fileToExamPhoto(file: File): Promise<ExamPhoto | PhotoRejection> {
  if (!ALLOWED_TYPES.includes(file.type)) return "type";
  if (file.size > MAX_FILE_BYTES) return "size";
  const resized = await resizeImage(file);
  return { id: crypto.randomUUID(), src: await readAsDataUrl(resized), caption: "" };
}

// Photos are large, so they are kept under their own key. If the browser's
// storage is full only the photos are lost after a refresh, never the typed form.
const PHOTOS_KEY = "arun-dental-exam-photos-v1";

export function loadPhotos(): ExamPhoto[] {
  try {
    const raw = window.localStorage.getItem(PHOTOS_KEY);
    const parsed = raw ? (JSON.parse(raw) as ExamPhoto[]) : [];
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p?.src === "string") : [];
  } catch {
    return [];
  }
}

// Returns false when the photos could not be remembered.
export function savePhotos(photos: ExamPhoto[]): boolean {
  try {
    if (photos.length === 0) window.localStorage.removeItem(PHOTOS_KEY);
    else window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    return true;
  } catch {
    return false;
  }
}
