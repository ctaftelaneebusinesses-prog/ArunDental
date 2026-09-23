import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { HttpError } from "../middleware/errorHandler.middleware";
import { downloadPatientPhoto, deletePatientPhoto } from "../services/storage.service";

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

// Registered before the "/:id" route below — Express matches routes in order,
// so "/export" would otherwise be swallowed as an :id value of "export".
patientsRouter.get("/export", async (_req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      // Only the most recent appointment — a patient can have several over
      // time, and the sheet shows one status per row.
      include: { appointments: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    res.json({
      patients: patients.map((patient) => ({
        opNumber: patient.opNumber,
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        occupation: patient.occupation,
        address: patient.address,
        dentalProblem: patient.dentalProblem,
        previousTreatment: patient.previousTreatment,
        status: patient.appointments[0]?.status ?? null,
        appointmentDate: patient.appointments[0]?.appointmentDate ?? null,
        sittingCount: patient.appointments[0]?.sittingCount ?? null,
        paymentStatus: patient.appointments[0]?.paymentStatus ?? null,
        feeAmount: patient.appointments[0]?.feeAmount ?? null,
        createdAt: patient.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

patientsRouter.get("/", async (req, res, next) => {
  try {
    const { q, date } = req.query;
    const search = typeof q === "string" ? q.trim() : "";

    const patients = await prisma.patient.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { opNumber: { contains: search, mode: "insensitive" } },
                  { name: { contains: search, mode: "insensitive" } },
                  { mobile: { contains: search } },
                ],
              }
            : {},
          typeof date === "string" && date
            ? { appointments: { some: { appointmentDate: date } } }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json({
      patients: patients.map((patient) => ({
        id: patient.id,
        opNumber: patient.opNumber,
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        createdAt: patient.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

patientsRouter.get("/:id", async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: { appointments: { orderBy: { appointmentDate: "desc" } } },
    });

    if (!patient) {
      throw new HttpError(404, "Patient not found.");
    }

    res.json({ patient });
  } catch (err) {
    next(err);
  }
});

patientsRouter.get("/:id/photo", async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!patient) {
      throw new HttpError(404, "Patient not found.");
    }

    // Patients booked without a photo store an empty key.
    const photo = patient.photoPath ? await downloadPatientPhoto(patient.photoPath) : null;
    if (!photo) {
      throw new HttpError(404, "Photo not found.");
    }

    res.setHeader("Content-Type", photo.contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(photo.data);
  } catch (err) {
    next(err);
  }
});

// Permanently removes a patient and every appointment booked under them —
// requested by the clinic for records that were entered by mistake or that a
// patient has asked to have removed. There is no undo.
patientsRouter.delete("/:id", async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!patient) {
      throw new HttpError(404, "Patient not found.");
    }

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { patientId: patient.id } }),
      prisma.patient.delete({ where: { id: patient.id } }),
    ]);

    if (patient.photoPath) {
      await deletePatientPhoto(patient.photoPath).catch(() => undefined);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
