/*
  Warnings:

  - You are about to drop the column `userId` on the `Matching` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personId,interestedInId]` on the table `Matching` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `personId` to the `Matching` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Matching" DROP CONSTRAINT "Matching_userId_fkey";

-- DropIndex
DROP INDEX "Matching_userId_interestedInId_key";

-- AlterTable
ALTER TABLE "Matching" DROP COLUMN "userId",
ADD COLUMN     "personId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Matching_personId_interestedInId_key" ON "Matching"("personId", "interestedInId");

-- AddForeignKey
ALTER TABLE "Matching" ADD CONSTRAINT "Matching_personId_fkey" FOREIGN KEY ("personId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
