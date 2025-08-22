-- CreateEnum
CREATE TYPE "ChainKind" AS ENUM ('EVM', 'SOLANA', 'NATIVE');

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "chainKind" "ChainKind" NOT NULL,
    "chainId" INTEGER,
    "address" TEXT,
    "slug" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoURI" TEXT,
    "sources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVote" (
    "id" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "dateYmd" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coin_slug_key" ON "Coin"("slug");

-- CreateIndex
CREATE INDEX "Coin_symbol_idx" ON "Coin"("symbol");

-- CreateIndex
CREATE INDEX "Coin_name_idx" ON "Coin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_chainId_address_key" ON "Coin"("chainId", "address");

-- CreateIndex
CREATE INDEX "DailyVote_dateYmd_idx" ON "DailyVote"("dateYmd");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVote_coinId_dateYmd_key" ON "DailyVote"("coinId", "dateYmd");

-- AddForeignKey
ALTER TABLE "DailyVote" ADD CONSTRAINT "DailyVote_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
