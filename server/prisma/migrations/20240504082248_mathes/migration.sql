/*
  Warnings:

  - You are about to drop the column `user1Id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matcherUserId,matchedByUserId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchedByUserId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matcherUserId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_user2Id_fkey";

-- DropIndex
DROP INDEX "Match_user1Id_user2Id_key";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "matchedByUserId" TEXT NOT NULL,
ADD COLUMN     "matcherUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Match_matcherUserId_matchedByUserId_key" ON "Match"("matcherUserId", "matchedByUserId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matcherUserId_fkey" FOREIGN KEY ("matcherUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchedByUserId_fkey" FOREIGN KEY ("matchedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
