/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `taskState` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "isCompleted",
DROP COLUMN "taskState",
ADD COLUMN     "isTaskCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + INTERVAL '48 hours');
