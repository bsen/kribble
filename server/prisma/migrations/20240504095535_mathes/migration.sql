-- CreateTable
CREATE TABLE "Matches" (
    "id" TEXT NOT NULL,
    "userOneId" TEXT NOT NULL,
    "userTwoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matches_userOneId_userTwoId_key" ON "Matches"("userOneId", "userTwoId");

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
