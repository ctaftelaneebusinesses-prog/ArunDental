import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
  supabaseUrl: required("SUPABASE_URL"),
  // Server-side only. Bypasses Row Level Security — never expose to the browser.
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  supabasePhotoBucket: process.env.SUPABASE_PHOTO_BUCKET ?? "patient-photos",
};
