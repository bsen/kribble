/*
  Warnings:

  - You are about to drop the `ProfileMatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfileMatch" DROP CONSTRAINT "ProfileMatch_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileMatch" DROP CONSTRAINT "ProfileMatch_recipientId_fkey";

-- DropTable
DROP TABLE "ProfileMatch";

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "person1Id" TEXT NOT NULL,
    "person2Id" TEXT NOT NULL,
    "task" TEXT,
    "taskState" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_person1Id_person2Id_key" ON "Match"("person1Id", "person2Id");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_person1Id_fkey" FOREIGN KEY ("person1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_person2Id_fkey" FOREIGN KEY ("person2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
