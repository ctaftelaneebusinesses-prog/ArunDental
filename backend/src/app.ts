import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { appointmentsRouter } from "./routes/appointments.routes";
import { enquiriesRouter } from "./routes/enquiries.routes";
import { patientsRouter } from "./routes/patients.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
