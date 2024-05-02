/*
  Warnings:

  - You are about to drop the column `memberCount` on the `Community` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Community" DROP COLUMN "memberCount",
ADD COLUMN     "membersCount" INTEGER NOT NULL DEFAULT 0;
