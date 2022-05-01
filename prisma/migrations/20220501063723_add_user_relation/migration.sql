/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessions` on the `users` table. All the data in the column will be lost.
  - The required column `session_id` was added to the `Session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "token",
ADD COLUMN     "session_id" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sessions";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
