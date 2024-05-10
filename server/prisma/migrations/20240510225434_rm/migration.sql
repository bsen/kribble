/*
  Warnings:

  - You are about to drop the column `category` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `interest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `SecretNotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SecretNotes" DROP CONSTRAINT "SecretNotes_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "SecretNotes" DROP CONSTRAINT "SecretNotes_writerId_fkey";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "interest";

-- DropTable
DROP TABLE "SecretNotes";
