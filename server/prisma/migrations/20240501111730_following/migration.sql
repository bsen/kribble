/*
  Warnings:

  - You are about to drop the `Following` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_followingId_fkey";

-- DropTable
DROP TABLE "Following";
