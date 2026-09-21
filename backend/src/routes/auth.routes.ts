import { Router } from "express";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { loginRateLimiter } from "../middleware/rateLimit.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { loginSchema } from "../utils/validation";
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME, signToken, verifyPassword } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(401).json({ error: "Session no longer valid." });
      return;
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});
