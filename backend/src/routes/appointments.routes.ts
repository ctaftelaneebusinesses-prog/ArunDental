import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { HttpError } from "../middleware/errorHandler.middleware";
import { uploadPatientPhoto } from "../middleware/upload.middleware";
import { publicFormRateLimiter } from "../middleware/rateLimit.middleware";
import { generateOpNumber } from "../services/opNumber.service";
import { deletePatientPhoto, savePatientPhoto } from "../services/storage.service";
import {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  addPaymentSchema,
  updateAppointmentFeeSchema,
  updateAppointmentSittingSchema,
  updateAppointmentStatusSchema,
} from "../utils/validation";
import { CLINIC } from "../config/clinic";
import { notifyNewOp } from "../services/notification.service";
import { feeDetails, syncPaymentStatus } from "../services/fees.service";

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
          appointmentDate: data.preferredDate,
          appointmentTime: data.preferredTime,
          status: "Pending",
        },
      });

      notifyNewOp({ ...patient, appointmentDate: appointment.appointmentDate, appointmentTime: appointment.appointmentTime });

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
      include: { patient: true, payments: true },
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
        // feeAmount, paidAmount, dueAmount, paymentStatus and the payment history.
        ...feeDetails(appointment),
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

const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

// Sets (or clears) the OP's total fee. It can't go below what's already been paid.
appointmentsRouter.patch("/:id/fee", requireAuth, async (req, res, next) => {
  try {
    const { feeAmount } = updateAppointmentFeeSchema.parse(req.body);
    const fees = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: req.params.id }, include: { payments: true } });
      if (!appointment) throw new HttpError(404, "Appointment not found.");
      const { paidAmount } = feeDetails(appointment);
      if (paidAmount > 0 && (feeAmount == null || feeAmount < paidAmount)) {
        throw new HttpError(400, `Total fee can't be less than the ${rupees(paidAmount)} already paid.`);
      }
      await tx.appointment.update({ where: { id: appointment.id }, data: { feeAmount } });
      return syncPaymentStatus(tx, appointment.id);
    });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

// Records an amount received. Needs a total fee first, and can't exceed what's due.
appointmentsRouter.post("/:id/payments", requireAuth, async (req, res, next) => {
  try {
    const { amount, method, note, paidOn } = addPaymentSchema.parse(req.body);
    const fees = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: req.params.id }, include: { payments: true } });
      if (!appointment) throw new HttpError(404, "Appointment not found.");
      const { feeAmount, dueAmount } = feeDetails(appointment);
      if (feeAmount == null || feeAmount === 0) {
        throw new HttpError(400, "Please set the total fee before recording a payment.");
      }
      if (amount > (dueAmount ?? 0)) {
        throw new HttpError(400, dueAmount ? `Amount is more than the due of ${rupees(dueAmount)}.` : "This OP is already fully paid.");
      }
      await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          amount,
          method,
          note: note || null,
          // Noon IST on the chosen day, so the date never shifts across time zones.
          ...(paidOn ? { paidAt: new Date(`${paidOn}T12:00:00+05:30`) } : {}),
        },
      });
      return syncPaymentStatus(tx, appointment.id);
    });
    res.status(201).json({ fees });
  } catch (err) {
    next(err);
  }
});

// Removes a payment entered by mistake.
appointmentsRouter.delete("/:id/payments/:paymentId", requireAuth, async (req, res, next) => {
  try {
    const fees = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: req.params.paymentId } });
      if (!payment || payment.appointmentId !== req.params.id) throw new HttpError(404, "Payment not found.");
      await tx.payment.delete({ where: { id: payment.id } });
      return syncPaymentStatus(tx, payment.appointmentId);
    });
    res.json({ fees });
  } catch (err) {
    next(err);
  }
});

// Permanently removes an appointment (e.g. a duplicate or test booking). If it
// was the patient's only appointment, the patient record and photo go too, so
// no empty patient is left behind. There is no undo.
appointmentsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: { include: { _count: { select: { appointments: true } } } } },
    });
    if (!appointment) {
      throw new HttpError(404, "Appointment not found.");
    }

    const { patient } = appointment;
    const removePatient = patient._count.appointments <= 1;

    await prisma.$transaction([
      prisma.appointment.delete({ where: { id: appointment.id } }),
      ...(removePatient ? [prisma.patient.delete({ where: { id: patient.id } })] : []),
    ]);

    if (removePatient && patient.photoPath) {
      await deletePatientPhoto(patient.photoPath).catch(() => undefined);
    }

    res.json({ success: true, patientDeleted: removePatient });
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
