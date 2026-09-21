// Indian mobile numbers are stored as 10 digits; the admin taps these to reach the patient.
export function telHref(mobile: string): string {
  return `tel:+91${mobile}`;
}

export function whatsappHref(mobile: string, text?: string): string {
  const base = `https://wa.me/91${mobile}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
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
