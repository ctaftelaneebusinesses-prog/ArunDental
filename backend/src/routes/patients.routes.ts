import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth.middleware";
import { HttpError } from "../middleware/errorHandler.middleware";
import { downloadPatientPhoto } from "../services/storage.service";

export const patientsRouter = Router();

patientsRouter.use(requireAuth);

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
