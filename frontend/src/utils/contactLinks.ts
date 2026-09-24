import { clinicHoursSchedule, clinicInfo } from "../config/clinicInfo";
import { formatHoursRange, formatTime } from "./clinicHours";

// Indian mobile numbers are stored as 10 digits; the admin taps these to reach the patient.
export function telHref(mobile: string): string {
  return `tel:+91${mobile}`;
}

export function whatsappHref(mobile: string, text?: string): string {
  const base = `https://wa.me/91${mobile}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// "P.SAI GREESHMITHA" → "P.Sai Greeshmitha" — names arrive in whatever case
// the patient typed them.
function toTitleCase(name: string): string {
  return name.trim().toLowerCase().replace(/(^|[\s.])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

// "2026-09-25" → Date at local midnight (new Date("2026-09-25") would be UTC).
function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

// OP confirmation the staff send to the patient over WhatsApp — the free,
// one-tap alternative to paid SMS. Opens WhatsApp pre-filled; staff press Send.
// Uses WhatsApp formatting: *bold*, _italic_. Avoid lines starting with "- "
// (WhatsApp renders them as bullets).
export function opConfirmationText(appointment: {
  patientName: string;
  opNumber: string;
  appointmentDate: string;
  appointmentTime: string | null;
}): string {
  const date = parseIsoDate(appointment.appointmentDate);
  const dateText = formatLongDate(appointment.appointmentDate);

  const dayHours = date
    ? clinicHoursSchedule.find((d) => d.day === date.toLocaleDateString("en-US", { weekday: "long" }))
    : undefined;
  const timeLine = appointment.appointmentTime
    ? `*Time:* ${formatTime(appointment.appointmentTime)}`
    : dayHours
      ? `*Clinic Hours:* ${formatHoursRange(dayHours)}`
      : null;

  return [
    `*${clinicInfo.name.toUpperCase()}*`,
    `_OP Registration Confirmation_`,
    ``,
    `Dear ${toTitleCase(appointment.patientName)},`,
    ``,
    `Thank you for choosing ${clinicInfo.name}. Your OP registration has been confirmed. Please find the details below:`,
    ``,
    `*OP Number:* ${appointment.opNumber}`,
    `*Date:* ${dateText}`,
    ...(timeLine ? [timeLine] : []),
    `*Consultant:* ${clinicInfo.doctorName}, ${clinicInfo.qualification}`,
    ``,
    `*Clinic Address:*`,
    clinicInfo.addressLine1,
    clinicInfo.addressLine2,
    `Location: ${clinicInfo.googleMapsUrl}`,
    ``,
    `Kindly arrive 10 minutes before your visit and show this OP number at the reception.`,
    ``,
    `For queries or rescheduling, please call ${clinicInfo.phoneDisplay}.`,
    ``,
    `Warm regards,`,
    `*${clinicInfo.name}*`,
  ].join("\n");
}

function formatLongDate(value: string): string {
  const date = parseIsoDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : value;
}

// Message the patient sends to the clinic's WhatsApp from the OP confirmation
// page, asking the clinic to confirm their booking.
export function patientConfirmationRequestText(result: {
  patientName: string;
  opNumber: string;
  appointmentDate: string;
  appointmentTime?: string | null;
}): string {
  const name = toTitleCase(result.patientName);
  return [
    `*OP Registration – Confirmation Request*`,
    ``,
    `Dear ${clinicInfo.name} Team,`,
    ``,
    `I have registered for an OP through your website. Kindly confirm my appointment.`,
    ``,
    `*OP Number:* ${result.opNumber}`,
    `*Patient Name:* ${name}`,
    `*Preferred Date:* ${formatLongDate(result.appointmentDate)}`,
    ...(result.appointmentTime ? [`*Preferred Time:* ${formatTime(result.appointmentTime)}`] : []),
    ``,
    `Thank you.`,
    ``,
    `Regards,`,
    name,
  ].join("\n");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
