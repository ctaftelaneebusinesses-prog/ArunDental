// Single source of truth for clinic identity and contact details.
// Every page reads from this file only — update details here once and they
// propagate everywhere (nav, footer, contact page, location page, OP slip).

export interface DayHours {
  day: string;
  // 24-hour "HH:MM" format, or null for a closed day.
  open: string | null;
  close: string | null;
}

// Monday-first order, matching Date#getDay() rotated (0 = Sunday in JS).
export const clinicHoursSchedule: DayHours[] = [
  { day: "Monday", open: "09:00", close: "20:00" },
  { day: "Tuesday", open: "09:00", close: "20:00" },
  { day: "Wednesday", open: "09:00", close: "20:00" },
  { day: "Thursday", open: "09:00", close: "20:00" },
  { day: "Friday", open: "09:00", close: "20:00" },
  { day: "Saturday", open: "09:00", close: "20:00" },
  { day: "Sunday", open: "09:00", close: "13:00" },
];

export const clinicInfo = {
  name: "Dr. Arun Dental Care",
  doctorName: "Dr. Arun",
  qualification: "BDS, FGD",
  location: "Kuppam, Andhra Pradesh",

  addressLine1: "BSNL Office Road, Nethaji Road",
  addressLine2: "Kuppam, Andhra Pradesh 517425",
  fullAddress:
    "BSNL Office Road, Nethaji Road, Kuppam, Andhra Pradesh 517425",

  domain: "drarundentalcare.com",

  // Landline for "Call Clinic" — deliberately different from the WhatsApp
  // number below. Confirmed by the client Sep 2026; do not merge these back
  // into one number.
  phoneDisplay: "08570-255477",
  phoneHref: "tel:+918570255477",

  whatsappNumber: "916302952629",

  instagramUrl: "https://www.instagram.com/dr_arundentalcare_kuppam?stkn=YnV3ZDhrdHQwcHlv",

  // Built from the confirmed address above (no Google API key required).
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Dr Arun Dental Care, BSNL Office Road, Bairaganipalle, Andhra Pradesh 517425"),
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Dr Arun Dental Care, BSNL Office Road, Bairaganipalle, Andhra Pradesh 517425") +
    "&output=embed",

  // Sourced from the clinic's public Justdial listing (Sep 2026). Review this
  // figure periodically — it's a live number that can change — and swap in a
  // verified Google Business rating + review count here once available.
  ratingValue: 5.0,
  ratingSource: "Justdial",
} as const;

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clinicInfo.whatsappNumber}?text=${encoded}`;
}
