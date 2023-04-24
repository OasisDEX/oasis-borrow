ALTER TABLE "discover"
    ADD "token" TEXT,
    ADD "vault_type" TEXT;

DROP VIEW "high_risk";

DROP VIEW "most_yield";

DROP VIEW "largest_debt";

DROP VIEW "highest_pnl";

DROP VIEW "discover_with_coll_data";

CREATE VIEW "discover_with_coll_data" AS
SELECT
    *
FROM
    "discover"
    LEFT JOIN "collateral_type" ON "discover"."collateral_type" = "collateral_type"."collateral_name"
    LEFT JOIN "vault" ON cast("discover"."position_id" AS integer) = "vault"."vault_id";

CREATE VIEW "high_risk" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") AS "collateral_ratio",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") - "liquidation_ratio" AS "liquidation_proximity",
    "liquidation_ratio" * ("vault_normalized_debt" * "rate") / "vault_collateral" AS "liquidation_price",
    "next_price",
    "vault_collateral" * "current_price" AS "liquidation_value",
    "status",
    "type"
FROM
    "discover_with_coll_data";

CREATE VIEW "largest_debt" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    ("vault_normalized_debt" * "rate") AS "vault_debt",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") AS "coll_ratio",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

CREATE VIEW "highest_pnl" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / ("vault_collateral" * ("current_price") - ("vault_normalized_debt" * "rate")) AS "vault_multiple",
    "pnl_1d",
    "pnl_7d",
    "pnl_30d",
    "pnl_365d",
    "pnl_all",
    "pnl_ytd",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

CREATE VIEW "most_yield" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * ("current_price") AS "collateral_value",
    "vault_collateral" * ("current_price") - ("vault_normalized_debt" * "rate") AS "net_value",
    ("vault_normalized_debt" * "rate") * "liquidation_penalty" AS "liquidation_value",
    "pnl_1d",
    "pnl_7d",
    "pnl_30d",
    "pnl_365d",
    "pnl_all",
    "pnl_ytd",
    "yield_30d",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

