-- CreateEnum
CREATE TYPE "Apps" AS ENUM ('MOBILE', 'DESKTOP', 'WEB');

-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "client_ip" TEXT NOT NULL,
    "client_user_agent" TEXT NOT NULL,
    "client_app" "Apps" NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("token")
);
