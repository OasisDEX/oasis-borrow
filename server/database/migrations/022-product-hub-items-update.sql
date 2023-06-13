ALTER TABLE "product_hub_items"
DROP COLUMN "with50Tokens";

CREATE TYPE "managementTypeSimple" AS ENUM ('active', 'passive');

UPDATE "product_hub_items"
SET "managementType" = 'active'
WHERE "managementType" = 'active_with_liq_risk';

ALTER TABLE "product_hub_items"
ALTER COLUMN "managementType" TYPE "managementTypeSimple"
USING ("managementType"::text::"managementTypeSimple")
