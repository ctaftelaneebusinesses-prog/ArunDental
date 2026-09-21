import fs from "fs";
import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadPatientPhoto } from "../middleware/upload.middleware";
import { publicFormRateLimiter } from "../middleware/rateLimit.middleware";
import { HttpError } from "../middleware/errorHandler.middleware";
import { generateOpNumber } from "../services/opNumber.service";
import {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../utils/validation";
import { CLINIC } from "../config/clinic";

export const appointmentsRouter = Router();

appointmentsRouter.post(
  "/",
  publicFormRateLimiter,
  uploadPatientPhoto.single("photo"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new HttpError(400, "A patient photo is required.");
      }

      const data = createAppointmentSchema.parse(req.body);

      const opNumber = await generateOpNumber();

      const patient = await prisma.patient.create({
        data: {
          opNumber,
          name: data.name,
          mobile: data.mobile,
          address: data.address,
          age: data.age,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          dentalProblem: data.dentalProblem,
          previousTreatment: data.previousTreatment,
          photoPath: req.file.filename,
        },
      });

      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          opNumber,
          appointmentDate: data.preferredDate || new Date().toISOString().slice(0, 10),
          appointmentTime: data.preferredTime,
          status: "Pending",
        },
      });

      res.status(201).json({
        opNumber: appointment.opNumber,
        patientName: patient.name,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        doctorName: CLINIC.doctorName,
        qualification: CLINIC.qualification,
      });
    } catch (err) {
      if (req.file) {
        fs.unlink(req.file.path, () => undefined);
      }
      next(err);
    }
  }
);

appointmentsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { date, status } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(typeof date === "string" && date ? { appointmentDate: date } : {}),
        ...(typeof status === "string" && status ? { status } : {}),
      },
      include: { patient: true },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
    });

    res.json({
      // Everything the patient submitted on the Book OP form, so the admin can
      // review a request without opening a second screen. The photo itself is
      // served separately (GET /api/patients/:id/photo) behind the same auth.
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        opNumber: appointment.opNumber,
        patientId: appointment.patient.id,
        patientName: appointment.patient.name,
        mobile: appointment.patient.mobile,
        address: appointment.patient.address,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
        bloodGroup: appointment.patient.bloodGroup,
        dentalProblem: appointment.patient.dentalProblem,
        previousTreatment: appointment.patient.previousTreatment,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        createdAt: appointment.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = updateAppointmentStatusSchema.parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.patch("/:id/reschedule", requireAuth, async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = rescheduleAppointmentSchema.parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { appointmentDate, appointmentTime, status: "Confirmed" },
    });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});
