import { z } from "zod";

const mobileRegex = /^[6-9]\d{9}$/;

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"] as const;
export const genders = ["Male", "Female", "Other", "Prefer not to say"] as const;
export const appointmentStatuses = ["Pending", "Confirmed", "Arrived", "Completed", "Cancelled"] as const;
export const paymentStatuses = ["Payment Pending", "Payment Completed"] as const;

export const createAppointmentSchema = z.object({
  name: z.string().trim().min(2, "Please enter the patient's full name."),
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, "Please enter a valid 10-digit mobile number."),
  address: z.string().trim().min(5, "Please enter a complete address."),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(genders).optional(),
  bloodGroup: z.enum(bloodGroups).optional(),
  occupation: z.string().trim().min(1, "Please select an occupation.").max(100),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a preferred date."),
  preferredTime: z.string().optional(),
  dentalProblem: z.string().trim().max(1000).optional(),
  previousTreatment: z.string().trim().max(1000).optional(),
  // Multipart fields always arrive as strings — compare literally so a
  // stray "false" (which z.coerce.boolean() would otherwise treat as
  // truthy, since Boolean("false") === true) is correctly rejected.
  consent: z.preprocess(
    (val) => val === "true" || val === true,
    z.literal(true, { errorMap: () => ({ message: "Please confirm the consent statement to proceed." }) })
  ),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatuses),
});

export const updateAppointmentSittingSchema = z.object({
  sittingCount: z.coerce.number().int().min(1, "Sitting count can't go below 1.").max(50),
});

export const updateAppointmentPaymentStatusSchema = z
  .object({
    paymentStatus: z.enum(paymentStatuses).optional(),
    // null clears the amount; omitted leaves it unchanged.
    feeAmount: z.coerce.number().int().min(0, "Amount can't be negative.").max(10_000_000).nullable().optional(),
  })
  .refine((body) => body.paymentStatus !== undefined || body.feeAmount !== undefined, {
    message: "Nothing to update.",
  });

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().min(1, "Please choose a date."),
  appointmentTime: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});
