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
  // New-OP email to the doctor. All optional — if the settings are missing the
  // email is skipped, so booking keeps working before mail is configured.
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT ?? 465),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  mailFrom: process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "",
  doctorEmail: process.env.DOCTOR_EMAIL ?? "",
};
