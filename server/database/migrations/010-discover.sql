-- CreateTable
CREATE TABLE "discover" (
    "protocol_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "collateral_type" TEXT NOT NULL,
    "liquidation_price" DECIMAL(65, 30) NOT NULL,
    "liquidation_value" DECIMAL(65, 30) NOT NULL,
    "collateral_value" DECIMAL(65, 30) NOT NULL,
    "vault_multiple" DECIMAL(65, 30) NOT NULL,
    "next_price" DECIMAL(65, 30) NOT NULL,
    "net_value" DECIMAL(65, 30) NOT NULL,
    "yield_30d" DECIMAL(65, 30) NOT NULL,
    "vault_debt" DECIMAL(65, 30) NOT NULL,
    "coll_ratio" DECIMAL(65, 30) NOT NULL,
    "status" TEXT NOT NULL,
    "last_action" TEXT NOT NULL,
    "profit_and_loss_all" DECIMAL(65, 30) NOT NULL,
    "profit_and_loss_1d" DECIMAL(65, 30) NOT NULL,
    "profit_and_loss_7d" DECIMAL(65, 30) NOT NULL,
    "profit_and_loss_30d" DECIMAL(65, 30) NOT NULL,
    "profit_and_loss_365d" DECIMAL(65, 30) NOT NULL,
    "earned_to_date_all" DECIMAL(65, 30) NOT NULL,
    "earned_to_date_1d" DECIMAL(65, 30) NOT NULL,
    "earned_to_date_7d" DECIMAL(65, 30) NOT NULL,
    "earned_to_date_30d" DECIMAL(65, 30) NOT NULL,
    "earned_to_date_365d" DECIMAL(65, 30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE VIEW "high_risk" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "collateral_value",
    "liquidation_price",
    "next_price",
    "liquidation_value",
    "status"
FROM "discover"
ORDER BY "discover"."liquidation_price" DESC;
CREATE VIEW "largest_debt" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "collateral_value",
    "vault_debt",
    "coll_ratio",
    "last_action"
FROM "discover"
ORDER BY "discover"."vault_debt" DESC;
CREATE VIEW "highest_pnl" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "collateral_value",
    "vault_multiple",
    "profit_and_loss_1d" AS "t_1d",
    "profit_and_loss_7d" AS "t_7d",
    "profit_and_loss_30d" AS "t_30d",
    "profit_and_loss_365d" AS "t_365d",
    "profit_and_loss_all" AS "t_all",
    "last_action"
FROM "discover"
ORDER BY "discover"."profit_and_loss_1d" DESC;
CREATE VIEW "most_yield" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "collateral_value",
    "net_value",
    "earned_to_date_1d" AS "t_1d",
    "earned_to_date_7d" AS "t_7d",
    "earned_to_date_30d" AS "t_30d",
    "earned_to_date_365d" AS "t_365d",
    "earned_to_date_all" AS "t_all",
    "yield_30d",
    "last_action"
FROM "discover"
ORDER BY "discover"."earned_to_date_1d" DESC;
-- CreateIndex
CREATE UNIQUE INDEX "discover_protocol_id_position_id_key" ON "discover"("protocol_id", "position_id");