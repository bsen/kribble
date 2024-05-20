-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "ttl" SET DEFAULT (NOW() + INTERVAL '1 day');
