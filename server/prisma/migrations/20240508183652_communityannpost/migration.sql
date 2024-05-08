-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "anonymousPostId" TEXT;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "anonymousPostId" TEXT;

-- CreateTable
CREATE TABLE "CommunityAnonymousPosts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "image" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityAnonymousPosts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommunityAnonymousPosts" ADD CONSTRAINT "CommunityAnonymousPosts_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_anonymousPostId_fkey" FOREIGN KEY ("anonymousPostId") REFERENCES "CommunityAnonymousPosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_anonymousPostId_fkey" FOREIGN KEY ("anonymousPostId") REFERENCES "CommunityAnonymousPosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
