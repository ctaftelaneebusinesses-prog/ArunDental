import nodemailer from "nodemailer";
import { env } from "../config/env";
import { CLINIC } from "../config/clinic";

export interface NewOpDetails {
  opNumber: string;
  name: string;
  mobile: string;
  address: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  occupation: string | null;
  dentalProblem: string | null;
  previousTreatment: string | null;
  appointmentDate: string;
  appointmentTime: string | null;
}

const transporter =
  env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      })
    : null;

// Everything in the email body comes from the public booking form, so it is
// escaped before being placed into HTML.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "P.SAI GREESHMITHA" → "P.Sai Greeshmitha".
function toTitleCase(name: string): string {
  return name.trim().toLowerCase().replace(/(^|[\s.])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

// "2026-09-25" → "Friday, 25 September 2026"; "14:30" → "2:30 PM".
function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function formatTime(value: string): string {
  const [hourStr, minuteStr = "00"] = value.split(":");
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return value;
  return `${hour % 12 === 0 ? 12 : hour % 12}:${minuteStr} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatWhen(details: NewOpDetails): string {
  const date = formatDate(details.appointmentDate);
  return details.appointmentTime ? `${date}, ${formatTime(details.appointmentTime)}` : date;
}

async function sendDoctorEmail(details: NewOpDetails): Promise<void> {
  if (!env.doctorEmail || !env.mailFrom || (!env.brevoApiKey && !transporter)) {
    console.warn("Doctor email skipped: set DOCTOR_EMAIL, MAIL_FROM and BREVO_API_KEY (or SMTP_USER/SMTP_PASS).");
    return;
  }

  const name = toTitleCase(details.name);
  const show = (value: string | number | null) => (value == null || value === "" ? "Not provided" : String(value));

  const sections: { title: string; rows: [string, string | number | null][] }[] = [
    {
      title: "Patient Details",
      rows: [
        ["Name", name],
        ["Mobile", details.mobile],
        ["Age", details.age == null ? null : `${details.age} years`],
        ["Gender", details.gender],
        ["Blood Group", details.bloodGroup],
        ["Occupation", details.occupation],
        ["Address", details.address],
      ],
    },
    {
      title: "Clinical Information",
      rows: [
        ["Chief Complaint", details.dentalProblem],
        ["Previous Treatment", details.previousTreatment],
      ],
    },
  ];

  const tableRows = (rows: [string, string | number | null][]) =>
    rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px 12px;width:38%;color:#5b6b7f;border-bottom:1px solid #eef1f5">${label}</td>` +
          `<td style="padding:8px 12px;color:#1c2b3a;font-weight:500;border-bottom:1px solid #eef1f5">${escapeHtml(show(value))}</td></tr>`
      )
      .join("");

  const html = `
<div style="background:#f4f6f9;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e3e8ef">
    <tr><td style="background:#0b4f8a;padding:20px 24px;color:#ffffff">
      <div style="font-size:20px;font-weight:700">${escapeHtml(CLINIC.name)}</div>
      <div style="font-size:13px;opacity:.85;margin-top:2px">New OP Registration</div>
    </td></tr>
    <tr><td style="padding:22px 24px 6px;color:#1c2b3a;font-size:14px;line-height:1.55">
      Dear ${escapeHtml(CLINIC.doctorName)},<br><br>
      A new patient has registered for an OP through the clinic website. Details are below.
    </td></tr>
    <tr><td style="padding:12px 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5fc;border:1px solid #cfe2f5;border-radius:8px">
        <tr>
          <td style="padding:14px 16px"><div style="font-size:12px;color:#5b6b7f">OP Number</div><div style="font-size:17px;font-weight:700;color:#0b4f8a">${escapeHtml(details.opNumber)}</div></td>
          <td style="padding:14px 16px"><div style="font-size:12px;color:#5b6b7f">Appointment</div><div style="font-size:14px;font-weight:600;color:#1c2b3a">${escapeHtml(formatWhen(details))}</div></td>
        </tr>
      </table>
    </td></tr>
    ${sections
      .map(
        (section) => `
    <tr><td style="padding:14px 24px 4px;font-size:13px;font-weight:700;color:#0b4f8a;text-transform:uppercase;letter-spacing:.5px">${section.title}</td></tr>
    <tr><td style="padding:0 24px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${tableRows(section.rows)}</table></td></tr>`
      )
      .join("")}
    <tr><td style="padding:14px 24px 22px;font-size:13px;color:#5b6b7f;line-height:1.5">
      You can review, confirm or reschedule this appointment from the admin dashboard.
    </td></tr>
    <tr><td style="background:#f8fafc;padding:14px 24px;font-size:12px;color:#8a97a8;border-top:1px solid #eef1f5">
      This is an automated notification from the ${escapeHtml(CLINIC.name)} website, ${escapeHtml(CLINIC.location)}. Patient information is confidential.
    </td></tr>
  </table>
</div>`;

  const text = [
    `${CLINIC.name} - New OP Registration`,
    ``,
    `Dear ${CLINIC.doctorName},`,
    `A new patient has registered for an OP through the clinic website.`,
    ``,
    `OP Number: ${details.opNumber}`,
    `Appointment: ${formatWhen(details)}`,
    ...sections.flatMap((section) => [``, section.title.toUpperCase(), ...section.rows.map(([label, value]) => `${label}: ${show(value)}`)]),
    ``,
    `You can review, confirm or reschedule this appointment from the admin dashboard.`,
  ].join("\n");

  await sendEmail({
    to: env.doctorEmail,
    subject: `New OP Registration | ${details.opNumber} | ${name} | ${formatDate(details.appointmentDate)}`,
    text,
    html,
  });
}

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Railway blocks outbound SMTP on its non-Pro plans, so in production mail goes
// through Brevo's HTTPS API when BREVO_API_KEY is set. SMTP (e.g. Gmail) is the
// fallback — handy for local development.
async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.brevoApiKey) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: CLINIC.name, email: env.mailFrom },
        to: [{ email: message.to }],
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html,
      }),
    });
    if (!response.ok) {
      throw new Error(`Brevo rejected the email (${response.status}): ${await response.text()}`);
    }
    return;
  }

  if (!transporter) {
    throw new Error("No email provider configured (set BREVO_API_KEY, or SMTP_USER and SMTP_PASS).");
  }
  await transporter.sendMail({ from: `"${CLINIC.name}" <${env.mailFrom}>`, ...message });
}

// Fire-and-forget: a mail outage must never fail the booking itself. Patients
// are messaged by staff from the admin dashboard's WhatsApp button instead.
export function notifyNewOp(details: NewOpDetails): void {
  sendDoctorEmail(details).catch((err) => console.error("Doctor email failed:", err));
}
