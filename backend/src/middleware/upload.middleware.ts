import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new Error("Only JPEG, PNG or WEBP images are allowed for the patient photo."));
    return;
  }
  callback(null, true);
}

// Held in memory only long enough to forward to Supabase Storage.
export const uploadPatientPhoto = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});
