/*
  Warnings:

  - You are about to drop the `DateMatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DateMatch" DROP CONSTRAINT "DateMatch_secondPersonId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "matchedUsers" TEXT[];

-- DropTable
DROP TABLE "DateMatch";
