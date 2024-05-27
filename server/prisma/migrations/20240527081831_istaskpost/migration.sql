-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + INTERVAL '24 hours');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isTaskPost" BOOLEAN NOT NULL DEFAULT false;
