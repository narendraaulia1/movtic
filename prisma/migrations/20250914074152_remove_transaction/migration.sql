/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Ticket" DROP CONSTRAINT "Ticket_transactionId_fkey";

-- AlterTable
ALTER TABLE "public"."Ticket" DROP COLUMN "transactionId",
ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Transaction";
