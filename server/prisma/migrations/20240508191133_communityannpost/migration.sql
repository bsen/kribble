/*
  Warnings:

  - You are about to drop the column `anonymousPostId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `anonymousPostId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the `CommunityAnonymousPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_anonymousPostId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityAnonymousPosts" DROP CONSTRAINT "CommunityAnonymousPosts_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_anonymousPostId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "anonymousPostId",
ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "anonymousPostId";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "anonymity" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "CommunityAnonymousPosts";
