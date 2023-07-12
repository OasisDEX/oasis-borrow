-- CreateTable
CREATE TABLE "ajna_rewards_weekly_claim" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chain_id" INTEGER NOT NULL,
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
    "chain_id" INTEGER NOT NULL,
    "user_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_number" INTEGER NOT NULL,

    CONSTRAINT "ajna_rewards_daily_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajna_rewards_merkle_tree" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chain_id" INTEGER NOT NULL,
    "week_number" INTEGER NOT NULL,
    "tree_root" TEXT NOT NULL,
    "tx_processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ajna_rewards_merkle_tree_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_weekly_claim_week_number_user_address_chain_id_key" ON "ajna_rewards_weekly_claim"("week_number", "user_address", "chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_daily_claim_day_number_user_address_chain_id_key" ON "ajna_rewards_daily_claim"("day_number", "user_address", "chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_merkle_tree_week_number_chain_id_key" ON "ajna_rewards_merkle_tree"("week_number", "chain_id");
