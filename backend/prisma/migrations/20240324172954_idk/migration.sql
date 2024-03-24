-- CreateTable
CREATE TABLE "DateMatch" (
    "firstPersonId" TEXT NOT NULL,
    "secondPersonId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DateMatch_firstPersonId_secondPersonId_key" ON "DateMatch"("firstPersonId", "secondPersonId");

-- AddForeignKey
ALTER TABLE "DateMatch" ADD CONSTRAINT "DateMatch_secondPersonId_fkey" FOREIGN KEY ("secondPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
