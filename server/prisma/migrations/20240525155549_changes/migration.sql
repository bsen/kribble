-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + INTERVAL '24 hours');
