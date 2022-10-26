-- CreateTable
CREATE TABLE "discover" (
    "protocol_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "collateral_type" TEXT NOT NULL,
    "vault_normalized_debt" DECIMAL(65, 30),
    "vault_debt" DECIMAL(65, 30) NOT NULL,
    "vault_collateral" DECIMAL(65, 30) NOT NULL,
    "yield_30d" DECIMAL(65, 30) NOT NULL,
    "status" JSONB NOT NULL,
    "last_action" JSONB NOT NULL,
    "pnl_all" DECIMAL(65, 30) NOT NULL,
    "pnl_1d" DECIMAL(65, 30) NOT NULL,
    "pnl_7d" DECIMAL(65, 30) NOT NULL,
    "pnl_30d" DECIMAL(65, 30) NOT NULL,
    "pnl_365d" DECIMAL(65, 30) NOT NULL,
    "pnl_ytd" DECIMAL(65, 30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "collateral_type" (
    "collateral_name" TEXT NOT NULL,
    "next_price" DECIMAL(65, 30) NOT NULL,
    "current_price" DECIMAL(65, 30) NOT NULL,
    "liquidation_ratio" DECIMAL(65, 30) NOT NULL,
    "liquidation_penalty" DECIMAL(65, 30) DEFAULT 1.13,
    "rate" DECIMAL(65, 30),
    "market_price" DECIMAL(65, 30),
    CONSTRAINT "collateral_name_key" PRIMARY KEY ("collateral_name")
);
CREATE VIEW "discover_with_coll_data" as
SELECT *
from "discover"
    LEFT JOIN "collateral_type" ON "discover"."collateral_type" = "collateral_type"."collateral_name";
CREATE VIEW "high_risk" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * "current_price" as "collateral_value",
    "liquidation_ratio" * "vault_debt" / "vault_collateral" as "liquidation_price",
    "next_price",
    "vault_collateral" * "current_price" as "liquidation_value",
    "status"
FROM "discover_with_coll_data";
CREATE VIEW "largest_debt" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * "current_price" as "collateral_value",
    "vault_debt",
    "vault_collateral" * "current_price" / "vault_debt" as "coll_ratio",
    "last_action"
FROM "discover_with_coll_data";
CREATE VIEW "highest_pnl" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * "current_price" as "collateral_value",
    "vault_collateral" * "current_price" / (
        "vault_collateral" * ("current_price") - "vault_debt"
    ) as "vault_multiple",
    "pnl_1d",
    "pnl_7d",
    "pnl_30d",
    "pnl_365d",
    "pnl_all",
    "pnl_ytd",
    "last_action"
FROM "discover_with_coll_data";
CREATE VIEW "most_yield" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * ("current_price") as "collateral_value",
    "vault_debt" * "liquidation_penalty" as "liquidation_value",
    "pnl_1d",
    "pnl_7d",
    "pnl_30d",
    "pnl_365d",
    "pnl_all",
    "pnl_ytd",
    "yield_30d",
    "last_action"
FROM "discover_with_coll_data";
-- CreateIndex
CREATE UNIQUE INDEX "discover_protocol_id_position_id_key" ON "discover"("protocol_id", "position_id");