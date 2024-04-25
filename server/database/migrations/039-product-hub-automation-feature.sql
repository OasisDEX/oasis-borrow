
CREATE TYPE "automationFeature" AS ENUM ('stopLoss', 'trailingStopLoss', 'autoBuy', 'autoSell', 'autoTakeProfit', 'partialTakeProfit', 'constantMultiple');

ALTER TABLE "product_hub_items"
  ADD COLUMN "automationFeatures" "automationFeature"[];
