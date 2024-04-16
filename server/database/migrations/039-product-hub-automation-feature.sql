
CREATE TYPE "automationFeature" AS ENUM ('stopLoss', 'autoBuy', 'autoSell', 'takeProfit', 'constantMultiple');

ALTER TABLE "product_hub_items"
  ADD COLUMN "automationFeatures" "automationFeature"[];
