/*
  Warnings:

  - You are about to drop the column `person1Id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `person2Id` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[initiatorId,matchedUserId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_person1Id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_person2Id_fkey";

-- DropIndex
DROP INDEX "Match_person1Id_person2Id_key";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "person1Id",
DROP COLUMN "person2Id",
ADD COLUMN     "initiatorId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "matchedUserId" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + INTERVAL '24 hours');

-- CreateIndex
CREATE UNIQUE INDEX "Match_initiatorId_matchedUserId_key" ON "Match"("initiatorId", "matchedUserId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchedUserId_fkey" FOREIGN KEY ("matchedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
