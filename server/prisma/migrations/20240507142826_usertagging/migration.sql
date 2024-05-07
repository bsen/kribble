/*
  Warnings:

  - You are about to drop the `UserTagOnComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTagOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTagOnComment" DROP CONSTRAINT "UserTagOnComment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagOnComment" DROP CONSTRAINT "UserTagOnComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagOnPost" DROP CONSTRAINT "UserTagOnPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagOnPost" DROP CONSTRAINT "UserTagOnPost_userId_fkey";

-- DropTable
DROP TABLE "UserTagOnComment";

-- DropTable
DROP TABLE "UserTagOnPost";

-- CreateTable
CREATE TABLE "TaggingOnPost" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaggingOnPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaggingOnComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaggingOnComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaggingOnPost_postId_userId_key" ON "TaggingOnPost"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaggingOnComment_commentId_userId_key" ON "TaggingOnComment"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "TaggingOnPost" ADD CONSTRAINT "TaggingOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaggingOnPost" ADD CONSTRAINT "TaggingOnPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaggingOnComment" ADD CONSTRAINT "TaggingOnComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaggingOnComment" ADD CONSTRAINT "TaggingOnComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
