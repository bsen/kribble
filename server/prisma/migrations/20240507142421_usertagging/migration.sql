-- CreateTable
CREATE TABLE "UserTagOnPost" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTagOnPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTagOnComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTagOnComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTagOnPost_postId_userId_key" ON "UserTagOnPost"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTagOnComment_commentId_userId_key" ON "UserTagOnComment"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "UserTagOnPost" ADD CONSTRAINT "UserTagOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagOnPost" ADD CONSTRAINT "UserTagOnPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagOnComment" ADD CONSTRAINT "UserTagOnComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagOnComment" ADD CONSTRAINT "UserTagOnComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
