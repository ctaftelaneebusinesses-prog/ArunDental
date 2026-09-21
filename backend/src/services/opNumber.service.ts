import { prisma } from "../db/prisma";
import { CLINIC } from "../config/clinic";

const SEQUENCE_DIGITS = 6;

function formatOpNumber(year: number, sequence: number): string {
  return `${CLINIC.opPrefix}-${year}-${String(sequence).padStart(SEQUENCE_DIGITS, "0")}`;
}

/**
 * Atomically reserves the next OP number for the current calendar year.
 *
 * A single upsert-and-increment maps to one Postgres `INSERT ... ON CONFLICT
 * DO UPDATE`, so two concurrent registrations can never receive the same
 * sequence number. The Appointment.opNumber unique constraint is a hard
 * backstop even if that guarantee were ever weakened.
 */
export async function generateOpNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { lastNumber } = await prisma.opSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  return formatOpNumber(year, lastNumber);
}
