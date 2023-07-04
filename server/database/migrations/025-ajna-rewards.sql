-- CreateTable
CREATE TABLE "ajna_rewards_weekly_claim" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "proof" TEXT[],

    CONSTRAINT "ajna_rewards_weekly_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajna_rewards_daily_claim" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_number" INTEGER NOT NULL,

    CONSTRAINT "ajna_rewards_daily_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajna_rewards_merkle_tree" (
    "week_number" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tree_root" TEXT NOT NULL,
    "tx_processed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_weekly_claim_week_number_user_address_key" ON "ajna_rewards_weekly_claim"("week_number", "user_address");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_daily_claim_day_number_user_address_key" ON "ajna_rewards_daily_claim"("day_number", "user_address");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_merkle_tree_week_number_key" ON "ajna_rewards_merkle_tree"("week_number");