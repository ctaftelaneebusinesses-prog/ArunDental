import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "patients");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new Error("Only JPEG, PNG or WEBP images are allowed for the patient photo."));
    return;
  }
  callback(null, true);
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    callback(null, `${uuidv4()}${extension}`);
  },
});

export const uploadPatientPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

export const PATIENT_UPLOAD_DIR = UPLOAD_DIR;
