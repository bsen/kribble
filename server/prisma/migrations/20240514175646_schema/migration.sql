/*
  Warnings:

  - You are about to drop the column `anonymity` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `anonymity` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Connect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Connections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaggingOnComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaggingOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Connect" DROP CONSTRAINT "Connect_mainUserId_fkey";

-- DropForeignKey
ALTER TABLE "Connect" DROP CONSTRAINT "Connect_otherUserId_fkey";

-- DropForeignKey
ALTER TABLE "Connections" DROP CONSTRAINT "Connections_mainUserId_fkey";

-- DropForeignKey
ALTER TABLE "Connections" DROP CONSTRAINT "Connections_otherUserId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaggingOnComment" DROP CONSTRAINT "TaggingOnComment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "TaggingOnComment" DROP CONSTRAINT "TaggingOnComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaggingOnPost" DROP CONSTRAINT "TaggingOnPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "TaggingOnPost" DROP CONSTRAINT "TaggingOnPost_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "anonymity",
ADD COLUMN     "isUnknownUser" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "type",
ADD COLUMN     "private" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "anonymity",
ADD COLUMN     "isUnknownUser" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Connect";

-- DropTable
DROP TABLE "Connections";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "TaggingOnComment";

-- DropTable
DROP TABLE "TaggingOnPost";

-- CreateTable
CREATE TABLE "ProfileMatch" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTagging" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentTagging" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentTagging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileMatch_initiatorId_recipientId_key" ON "ProfileMatch"("initiatorId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "PostLike"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTagging_postId_userId_key" ON "PostTagging"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentTagging_commentId_userId_key" ON "CommentTagging"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "ProfileMatch" ADD CONSTRAINT "ProfileMatch_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMatch" ADD CONSTRAINT "ProfileMatch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagging" ADD CONSTRAINT "PostTagging_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagging" ADD CONSTRAINT "PostTagging_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTagging" ADD CONSTRAINT "CommentTagging_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTagging" ADD CONSTRAINT "CommentTagging_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
