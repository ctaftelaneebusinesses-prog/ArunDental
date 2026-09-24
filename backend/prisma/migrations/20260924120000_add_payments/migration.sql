-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'Cash',
    "note" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_appointmentId_idx" ON "Payment"("appointmentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: OPs already marked "Payment Completed" with an amount get one
-- payment for that amount, so Paid/Due stay correct after the switch.
INSERT INTO "Payment" ("id", "appointmentId", "amount", "method", "note", "paidAt")
SELECT gen_random_uuid()::text, "id", "feeAmount", 'Cash', 'Recorded before payment tracking', "updatedAt"
FROM "Appointment"
WHERE "paymentStatus" = 'Payment Completed' AND "feeAmount" > 0;
