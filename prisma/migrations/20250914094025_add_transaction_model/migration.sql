-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'DEBIT');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "memberId" TEXT,
    "showtimeId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "public"."Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
