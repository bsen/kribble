/*
  Warnings:

  - You are about to drop the column `relationstatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "relationstatus",
ADD COLUMN     "interest" TEXT;
