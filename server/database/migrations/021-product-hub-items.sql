-- CreateEnum
CREATE TYPE "network" AS ENUM ('ethereum', 'arbitrum', 'polygon', 'optimism');

-- CreateEnum
CREATE TYPE "product" AS ENUM ('borrow', 'multiply', 'earn');

-- CreateEnum
CREATE TYPE "managementType" AS ENUM ('active', 'active_with_liq_risk', 'passive');

-- CreateEnum
CREATE TYPE "multiplyStrategyType" AS ENUM ('long', 'short');

-- CreateTable
CREATE TABLE "product_hub_items" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "network" "network" NOT NULL,
    "primaryToken" TEXT NOT NULL,
    "primaryTokenGroup" TEXT,
    "product" "product"[],
    "protocol" "protocol" NOT NULL,
    "secondaryToken" TEXT NOT NULL,
    "secondaryTokenGroup" TEXT,
    "weeklyNetApy" DECIMAL(65,30),
    "depositToken" TEXT,
    "earnStrategy" TEXT,
    "fee" DECIMAL(65,30),
    "liquidity" DECIMAL(65,30),
    "managementType" "managementType",
    "maxLtv" DECIMAL(65,30),
    "maxMultiply" DECIMAL(65,30),
    "multiplyStrategy" TEXT,
    "multiplyStrategyType" "multiplyStrategyType",
    "reverseTokens" BOOLEAN,
    "with50Tokens" DECIMAL(65,30),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_hub_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_hub_items_label_network_product_protocol_primaryTok_key" ON "product_hub_items"("label", "network", "product", "protocol", "primaryToken", "secondaryToken");
