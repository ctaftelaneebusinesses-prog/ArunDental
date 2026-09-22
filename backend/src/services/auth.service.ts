import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const SALT_ROUNDS = 12;
const TOKEN_TTL = "12h";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

export const AUTH_COOKIE_NAME = "adc_session";

export const AUTH_COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

// Frontend and backend are deployed on separate origins (e.g. two Railway
// services), so the session cookie is cross-site and needs SameSite=None +
// Secure to be sent on fetch() requests. In local dev, Vite proxies /api to
// the backend on the same origin, so Lax (without Secure, since dev is HTTP)
// works and is friendlier to test in a plain browser.
export const AUTH_COOKIE_OPTIONS = env.isProduction
  ? ({ httpOnly: true, secure: true, sameSite: "none" } as const)
  : ({ httpOnly: true, secure: false, sameSite: "lax" } as const);
