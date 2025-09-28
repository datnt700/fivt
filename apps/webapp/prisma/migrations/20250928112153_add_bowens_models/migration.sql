-- CreateTable
CREATE TABLE "public"."bowens_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bowensId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bowens_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bowens_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bowensAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION,
    "currency" TEXT,
    "accountNumber" TEXT,
    "institutionName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bowens_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bowens_users_userId_key" ON "public"."bowens_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bowens_users_bowensId_key" ON "public"."bowens_users"("bowensId");

-- CreateIndex
CREATE UNIQUE INDEX "bowens_accounts_bowensAccountId_key" ON "public"."bowens_accounts"("bowensAccountId");

-- AddForeignKey
ALTER TABLE "public"."bowens_users" ADD CONSTRAINT "bowens_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bowens_accounts" ADD CONSTRAINT "bowens_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
