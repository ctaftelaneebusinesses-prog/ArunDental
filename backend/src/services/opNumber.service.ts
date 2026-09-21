import { prisma } from "../db/prisma";
import { CLINIC } from "../config/clinic";

const SEQUENCE_DIGITS = 6;

function formatOpNumber(year: number, sequence: number): string {
  return `${CLINIC.opPrefix}-${year}-${String(sequence).padStart(SEQUENCE_DIGITS, "0")}`;
}

/**
 * Atomically reserves the next OP number for the current calendar year.
 *
 * Uses a transaction around an upsert-and-increment so two concurrent
 * registrations can never receive the same sequence number — SQLite (and
 * Postgres, if migrated to later) serializes writers within a transaction.
 * The Appointment.opNumber unique constraint is a hard backstop even if
 * that guarantee were ever weakened.
 *
 * Note: Prisma's `isolationLevel` transaction option is not supported on
 * SQLite, so it is deliberately omitted here; on Postgres the default
 * "Read Committed" level combined with the increment + unique constraint
 * is still race-safe for this access pattern.
 */
export async function generateOpNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const sequence = await prisma.$transaction(async (tx) => {
    const existing = await tx.opSequence.findUnique({ where: { year } });

    if (!existing) {
      const created = await tx.opSequence.create({
        data: { year, lastNumber: 1 },
      });
      return created.lastNumber;
    }

    const updated = await tx.opSequence.update({
      where: { year },
      data: { lastNumber: { increment: 1 } },
    });
    return updated.lastNumber;
  });

  return formatOpNumber(year, sequence);
}
