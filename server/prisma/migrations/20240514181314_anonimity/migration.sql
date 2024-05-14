/*
  Warnings:

  - You are about to drop the column `isUnknownUser` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isUnknownUser` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "isUnknownUser",
ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isUnknownUser",
ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;
