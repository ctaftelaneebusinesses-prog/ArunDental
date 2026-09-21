import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { publicFormRateLimiter } from "../middleware/rateLimit.middleware";
import { createEnquirySchema, updateEnquiryStatusSchema } from "../utils/validation";

export const enquiriesRouter = Router();

enquiriesRouter.post("/", publicFormRateLimiter, async (req, res, next) => {
  try {
    const data = createEnquirySchema.parse(req.body);
    const enquiry = await prisma.enquiry.create({ data });
    res.status(201).json({ enquiry: { id: enquiry.id, createdAt: enquiry.createdAt } });
  } catch (err) {
    next(err);
  }
});

enquiriesRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const enquiries = await prisma.enquiry.findMany({
      where: typeof status === "string" && status ? { status } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json({ enquiries });
  } catch (err) {
    next(err);
  }
});

enquiriesRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = updateEnquiryStatusSchema.parse(req.body);
    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ enquiry });
  } catch (err) {
    next(err);
  }
});
