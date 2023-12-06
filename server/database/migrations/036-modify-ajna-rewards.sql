/*
  Warnings:

  - A unique constraint covering the columns `[day_number,pool_address,account_address,chain_id,source,type]` on the table `ajna_rewards_daily_claim` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[week_number,chain_id,source]` on the table `ajna_rewards_merkle_tree` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[week_number,user_address,chain_id,source]` on the table `ajna_rewards_weekly_claim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_address` to the `ajna_rewards_daily_claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pool_address` to the `ajna_rewards_daily_claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `ajna_rewards_daily_claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ajna_rewards_daily_claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `ajna_rewards_merkle_tree` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `ajna_rewards_weekly_claim` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ajna_rewards_source" AS ENUM ('core', 'bonus');

-- CreateEnum
CREATE TYPE "ajna_rewards_position_type" AS ENUM ('earn', 'borrow');

-- DropIndex
DROP INDEX "ajna_rewards_daily_claim_day_number_user_address_chain_id_key";

-- DropIndex
DROP INDEX "ajna_rewards_merkle_tree_week_number_chain_id_key";

-- DropIndex
DROP INDEX "ajna_rewards_weekly_claim_week_number_user_address_chain_id_key";

-- AlterTable
ALTER TABLE "ajna_rewards_daily_claim" ADD COLUMN     "account_address" TEXT NOT NULL,
ADD COLUMN     "pool_address" TEXT NOT NULL,
ADD COLUMN     "source" "ajna_rewards_source" NOT NULL,
ADD COLUMN     "type" "ajna_rewards_position_type" NOT NULL;

-- AlterTable
ALTER TABLE "ajna_rewards_merkle_tree" ADD COLUMN     "source" "ajna_rewards_source" NOT NULL;

-- AlterTable
ALTER TABLE "ajna_rewards_weekly_claim" ADD COLUMN     "source" "ajna_rewards_source" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_daily_claim_day_number_pool_address_account_ad_key" ON "ajna_rewards_daily_claim"("day_number", "pool_address", "account_address", "chain_id", "source", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_merkle_tree_week_number_chain_id_source_key" ON "ajna_rewards_merkle_tree"("week_number", "chain_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "ajna_rewards_weekly_claim_week_number_user_address_chain_id_key" ON "ajna_rewards_weekly_claim"("week_number", "user_address", "chain_id", "source");
