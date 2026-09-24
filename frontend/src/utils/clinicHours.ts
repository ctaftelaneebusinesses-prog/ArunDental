import type { DayHours } from "../config/clinicInfo";

/** Returns today's schedule entry, or undefined if today isn't listed. */
export function getTodaysHours(schedule: DayHours[]): DayHours | undefined {
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return schedule.find((entry) => entry.day === todayName);
}

/** Whether the clinic is open right now, based on the local device clock. */
export function isClinicOpenNow(schedule: DayHours[]): boolean {
  const today = getTodaysHours(schedule);
  if (!today || !today.open || !today.close) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = today.open.split(":").map(Number);
  const [closeHour, closeMinute] = today.close.split(":").map(Number);

  return currentMinutes >= openHour * 60 + openMinute && currentMinutes < closeHour * 60 + closeMinute;
}

export function formatTime(value: string): string {
  const [hourStr, minuteStr] = value.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minuteStr === "00" ? `${displayHour} ${period}` : `${displayHour}:${minuteStr} ${period}`;
}

export function formatHoursRange(entry: DayHours): string {
  if (!entry.open || !entry.close) return "Closed";
  return `${formatTime(entry.open)} – ${formatTime(entry.close)}`;
}
