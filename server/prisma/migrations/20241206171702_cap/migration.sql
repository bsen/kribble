/*
  Warnings:

  - Made the column `caption` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "caption" SET NOT NULL;
