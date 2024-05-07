-- CreateTable
CREATE TABLE "SecretNotes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "writerId" TEXT,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretNotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecretNotes" ADD CONSTRAINT "SecretNotes_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretNotes" ADD CONSTRAINT "SecretNotes_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
