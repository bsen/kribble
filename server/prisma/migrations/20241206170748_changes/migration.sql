-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthdate" TIMESTAMP(3);
