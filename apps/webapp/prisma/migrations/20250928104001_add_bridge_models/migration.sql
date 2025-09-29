-- CreateTable
CREATE TABLE "public"."bridge_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bridgeUuid" TEXT NOT NULL,
    "externalUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bridge_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bridgeAccountId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION,
    "currencyCode" TEXT,
    "providerId" INTEGER,
    "dataAccess" TEXT NOT NULL DEFAULT 'enabled',
    "lastRefreshStatus" TEXT,
    "pro" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bridge_users_userId_key" ON "public"."bridge_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_users_bridgeUuid_key" ON "public"."bridge_users"("bridgeUuid");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_accounts_bridgeAccountId_key" ON "public"."bridge_accounts"("bridgeAccountId");

-- AddForeignKey
ALTER TABLE "public"."bridge_users" ADD CONSTRAINT "bridge_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bridge_accounts" ADD CONSTRAINT "bridge_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
