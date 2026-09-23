import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadPatientPhoto } from "../middleware/upload.middleware";
import { publicFormRateLimiter } from "../middleware/rateLimit.middleware";
import { generateOpNumber } from "../services/opNumber.service";
import { deletePatientPhoto, savePatientPhoto } from "../services/storage.service";
import {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentPaymentStatusSchema,
  updateAppointmentSittingSchema,
  updateAppointmentStatusSchema,
} from "../utils/validation";
import { CLINIC } from "../config/clinic";

export const appointmentsRouter = Router();

appointmentsRouter.post(
  "/",
  publicFormRateLimiter,
  uploadPatientPhoto.single("photo"),
  async (req, res, next) => {
    let photoKey: string | undefined;
    try {
      // Validate the form before touching storage so bad input never leaves an orphan photo.
      const data = createAppointmentSchema.parse(req.body);

      // The public Book OP form no longer collects a photo. This stays optional
      // (multipart still accepted) so a cached older page doesn't break.
      if (req.file) {
        photoKey = await savePatientPhoto(req.file);
      }
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
          occupation: data.occupation || null,
          dentalProblem: data.dentalProblem,
          previousTreatment: data.previousTreatment,
          // Column is non-null; an empty string means "no photo" (no migration needed).
          photoPath: photoKey ?? "",
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
      if (photoKey) {
        await deletePatientPhoto(photoKey).catch(() => undefined);
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
        hasPhoto: appointment.patient.photoPath !== "",
        patientName: appointment.patient.name,
        mobile: appointment.patient.mobile,
        address: appointment.patient.address,
        age: appointment.patient.age,
        gender: appointment.patient.gender,
        bloodGroup: appointment.patient.bloodGroup,
        occupation: appointment.patient.occupation,
        dentalProblem: appointment.patient.dentalProblem,
        previousTreatment: appointment.patient.previousTreatment,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        sittingCount: appointment.sittingCount,
        paymentStatus: appointment.paymentStatus,
        feeAmount: appointment.feeAmount,
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

appointmentsRouter.patch("/:id/sitting", requireAuth, async (req, res, next) => {
  try {
    const { sittingCount } = updateAppointmentSittingSchema.parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { sittingCount },
    });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.patch("/:id/payment-status", requireAuth, async (req, res, next) => {
  try {
    const { paymentStatus, feeAmount } = updateAppointmentPaymentStatusSchema.parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { paymentStatus, feeAmount },
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
