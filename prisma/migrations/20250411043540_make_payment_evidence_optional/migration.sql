/*
  Warnings:

  - You are about to drop the column `name` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Teller` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Teller` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Teller` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Teller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountStatus` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
-- DROP INDEX IF EXISTS "Teller_email_key";

-- -- AlterTable: Admin
-- ALTER TABLE "Admin"
-- DROP COLUMN IF EXISTS "name",
-- ADD COLUMN "password" TEXT NOT NULL,
-- ADD COLUMN "username" TEXT NOT NULL;

-- -- AlterTable: Teller
-- ALTER TABLE "Teller"
-- DROP COLUMN IF EXISTS "email",
-- DROP COLUMN IF EXISTS "name",
-- ADD COLUMN "bankAccountNumber" TEXT,
-- ADD COLUMN "bankName" TEXT,
-- ADD COLUMN "bio" TEXT,
-- ADD COLUMN "identificationCard" TEXT,
-- ADD COLUMN "identificationNumber" TEXT,
-- ADD COLUMN "profilePic" TEXT,
-- ADD COLUMN "specialty" TEXT,
-- ADD COLUMN "traffic" INTEGER,
-- ADD COLUMN "userId" INTEGER NOT NULL,
-- ADD COLUMN "verificationStatus" TEXT;

-- -- AlterTable: User
-- ALTER TABLE "User"
-- DROP COLUMN IF EXISTS "name",
-- ADD COLUMN "accountStatus" TEXT NOT NULL,
-- ADD COLUMN "birthDate" TIMESTAMP(3),
-- ADD COLUMN "firstName" TEXT,
-- ADD COLUMN "lastName" TEXT,
-- ADD COLUMN "password" TEXT NOT NULL,
-- ADD COLUMN "phoneNumber" TEXT,
-- ADD COLUMN "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN "username" TEXT NOT NULL;

-- -- CreateTable: Customer
-- CREATE TABLE IF NOT EXISTS "Customer" (
--     "id" SERIAL NOT NULL,
--     "userId" INTEGER NOT NULL,
--     "profilePic" TEXT,
--     CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable: PredictionAttribute
-- CREATE TABLE IF NOT EXISTS "PredictionAttribute" (
--     "id" SERIAL NOT NULL,
--     "customerId" INTEGER NOT NULL,
--     "birthPlace" TEXT,
--     "birthTime" TEXT,
--     "zodiacSign" TEXT,
--     "career" TEXT,
--     "relationship" TEXT,
--     CONSTRAINT "PredictionAttribute_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable: TellerPackage
-- CREATE TABLE IF NOT EXISTS "TellerPackage" (
--     "id" SERIAL NOT NULL,
--     "tellerId" INTEGER NOT NULL,
--     "packageDetail" TEXT,
--     "questionNumber" INTEGER,
--     "price" DOUBLE PRECISION NOT NULL,
--     CONSTRAINT "TellerPackage_pkey" PRIMARY KEY ("id")
-- );

-- AlterTable: Payment
ALTER TABLE "Payment"
ALTER COLUMN "paymentEvidence" DROP NOT NULL;

-- CreateIndex
-- CREATE UNIQUE INDEX IF NOT EXISTS "Customer_userId_key" ON "Customer"("userId");
-- CREATE UNIQUE INDEX IF NOT EXISTS "PredictionAttribute_customerId_key" ON "PredictionAttribute"("customerId");
-- CREATE UNIQUE INDEX IF NOT EXISTS "Teller_userId_key" ON "Teller"("userId");

-- -- AddForeignKey
-- ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "PredictionAttribute" ADD CONSTRAINT "PredictionAttribute_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Teller" ADD CONSTRAINT "Teller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "TellerPackage" ADD CONSTRAINT "TellerPackage_tellerId_fkey" FOREIGN KEY ("tellerId") REFERENCES "Teller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE "Payment" ADD CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TellerPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE "Session" ADD CONSTRAINT "Session_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE "Session" ADD CONSTRAINT "Session_tellerId_fkey" FOREIGN KEY ("tellerId") REFERENCES "Teller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Report" ADD CONSTRAINT "Report_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Report" ADD CONSTRAINT "Report_tellerId_fkey" FOREIGN KEY ("tellerId") REFERENCES "Teller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
