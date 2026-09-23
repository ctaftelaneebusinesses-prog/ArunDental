-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "sittingCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Appointment" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'Payment Pending';
