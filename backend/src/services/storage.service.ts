import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";

// Patient photos live in a *private* Supabase Storage bucket. The browser never
// talks to Supabase directly — photos are uploaded and streamed back through
// this API, so the existing admin auth still guards every read.
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function savePatientPhoto(file: Express.Multer.File): Promise<string> {
  const key = `${uuidv4()}${EXTENSIONS[file.mimetype] ?? ".jpg"}`;

  const { error } = await supabase.storage.from(env.supabasePhotoBucket).upload(key, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }
  return key;
}

export async function downloadPatientPhoto(key: string): Promise<{ data: Buffer; contentType: string } | null> {
  const { data, error } = await supabase.storage.from(env.supabasePhotoBucket).download(key);
  if (error || !data) return null;
  return { data: Buffer.from(await data.arrayBuffer()), contentType: data.type || "image/jpeg" };
}

export async function deletePatientPhoto(key: string): Promise<void> {
  await supabase.storage.from(env.supabasePhotoBucket).remove([key]);
}
