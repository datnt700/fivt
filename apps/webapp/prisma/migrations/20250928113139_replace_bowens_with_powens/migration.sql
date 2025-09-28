/*
  Warnings:

  - You are about to drop the `bowens_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bowens_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."bowens_accounts" DROP CONSTRAINT "bowens_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."bowens_users" DROP CONSTRAINT "bowens_users_userId_fkey";

-- DropTable
DROP TABLE "public"."bowens_accounts";

-- DropTable
DROP TABLE "public"."bowens_users";

-- CreateTable
CREATE TABLE "public"."powens_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "powensId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "powens_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."powens_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "powensAccountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION,
    "currency" TEXT,
    "accountNumber" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "bankName" TEXT NOT NULL,
    "bankCountryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "powens_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "powens_users_userId_key" ON "public"."powens_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "powens_users_powensId_key" ON "public"."powens_users"("powensId");

-- CreateIndex
CREATE UNIQUE INDEX "powens_accounts_powensAccountId_key" ON "public"."powens_accounts"("powensAccountId");

-- AddForeignKey
ALTER TABLE "public"."powens_users" ADD CONSTRAINT "powens_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."powens_accounts" ADD CONSTRAINT "powens_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
