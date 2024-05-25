/*
  Warnings:

  - You are about to drop the `CommentTagging` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTagging` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CommentTagging" DROP CONSTRAINT "CommentTagging_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentTagging" DROP CONSTRAINT "CommentTagging_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostTagging" DROP CONSTRAINT "PostTagging_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTagging" DROP CONSTRAINT "PostTagging_userId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + INTERVAL '24 hours');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "taggedUserId" TEXT,
ADD COLUMN     "task" TEXT;

-- DropTable
DROP TABLE "CommentTagging";

-- DropTable
DROP TABLE "PostTagging";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_taggedUserId_fkey" FOREIGN KEY ("taggedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
