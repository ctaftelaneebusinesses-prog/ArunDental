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
      pendingAppointments,
      totalAppointments,
    ] = await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: today } }),
      prisma.appointment.count({
        where: { appointmentDate: { gt: today }, status: { notIn: ["Cancelled", "Completed"] } },
      }),
      prisma.patient.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.appointment.count({ where: { status: "Pending" } }),
      prisma.appointment.count(),
    ]);

    res.json({
      todaysOp: todaysOpCount,
      upcomingAppointments,
      newPatients: newPatientsToday,
      // Awaiting the admin's attention (drives the tab badge).
      pendingAppointments,
      // Only ever grow, so the dashboard can detect a new arrival between polls.
      totalAppointments,
    });
  } catch (err) {
    next(err);
  }
});
