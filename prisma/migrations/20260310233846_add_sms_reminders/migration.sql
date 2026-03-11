-- AlterTable
ALTER TABLE "User" ADD COLUMN     "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsLastSentAt" TIMESTAMP(3),
ADD COLUMN     "smsOptedOutAt" TIMESTAMP(3),
ADD COLUMN     "smsPhone" TEXT,
ADD COLUMN     "smsReminderHour" INTEGER,
ADD COLUMN     "smsTimezone" TEXT;
