CREATE TYPE "earnStrategies" AS ENUM ('liquidity_provision', 'yield_loop', 'other');

ALTER TABLE "product_hub_items"
  ADD COLUMN "hasRewards" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "earnStrategyDescription" TEXT;

UPDATE "product_hub_items"
  SET "earnStrategyDescription"="earnStrategy";

ALTER TABLE "product_hub_items"
  DROP COLUMN "earnStrategy",
  ADD COLUMN "earnStrategy" "earnStrategies";

