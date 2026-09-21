import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";

export const dashboardRouter = Router();

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

dashboardRouter.get("/summary", requireAuth, async (_req, res, next) => {
  try {
    const today = todayString();
    const startOfToday = new Date(`${today}T00:00:00.000Z`);

    const [
      todaysOpCount,
      upcomingAppointments,
      newPatientsToday,
      pendingEnquiries,
      pendingAppointments,
      newEnquiries,
      totalAppointments,
      totalEnquiries,
    ] = await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: today } }),
      prisma.appointment.count({
        where: { appointmentDate: { gt: today }, status: { notIn: ["Cancelled", "Completed"] } },
      }),
      prisma.patient.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.enquiry.count({ where: { status: { in: ["New", "FollowUp"] } } }),
      prisma.appointment.count({ where: { status: "Pending" } }),
      prisma.enquiry.count({ where: { status: "New" } }),
      prisma.appointment.count(),
      prisma.enquiry.count(),
    ]);

    res.json({
      todaysOp: todaysOpCount,
      upcomingAppointments,
      newPatients: newPatientsToday,
      pendingEnquiries,
      // Awaiting the admin's attention (drives the tab badges).
      pendingAppointments,
      newEnquiries,
      // Only ever grow, so the dashboard can detect a new arrival between polls.
      totalAppointments,
      totalEnquiries,
    });
  } catch (err) {
    next(err);
  }
});
