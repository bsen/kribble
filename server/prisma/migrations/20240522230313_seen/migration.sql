/*
  Warnings:

  - You are about to drop the column `ttl` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "ttl",
ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;
