/*
  Warnings:

  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matches` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_matchedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_matcherUserId_fkey";

-- DropForeignKey
ALTER TABLE "Matches" DROP CONSTRAINT "Matches_userOneId_fkey";

-- DropForeignKey
ALTER TABLE "Matches" DROP CONSTRAINT "Matches_userTwoId_fkey";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Matches";

-- CreateTable
CREATE TABLE "Connect" (
    "id" TEXT NOT NULL,
    "mainUserId" TEXT NOT NULL,
    "otherUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connections" (
    "id" TEXT NOT NULL,
    "mainUserId" TEXT NOT NULL,
    "otherUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connect_mainUserId_otherUserId_key" ON "Connect"("mainUserId", "otherUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Connections_mainUserId_otherUserId_key" ON "Connections"("mainUserId", "otherUserId");

-- AddForeignKey
ALTER TABLE "Connect" ADD CONSTRAINT "Connect_mainUserId_fkey" FOREIGN KEY ("mainUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connect" ADD CONSTRAINT "Connect_otherUserId_fkey" FOREIGN KEY ("otherUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_mainUserId_fkey" FOREIGN KEY ("mainUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_otherUserId_fkey" FOREIGN KEY ("otherUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
