-- CreateTable
CREATE TABLE "Coments" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Coments" ADD CONSTRAINT "Coments_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
