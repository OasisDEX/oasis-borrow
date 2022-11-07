ALTER TABLE "collateral_type"
    ADD "token" TEXT;

ALTER TABLE "discover"
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
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / "vault_debt" - "liquidation_ratio" AS "liquidation_proximity",
    "liquidation_ratio" * "vault_debt" / "vault_collateral" AS "liquidation_price",
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
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_debt",
    "vault_collateral" * "current_price" / "vault_debt" AS "coll_ratio",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

CREATE VIEW "highest_pnl" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / ("vault_collateral" * ("current_price") - "vault_debt") AS "vault_multiple",
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
    "vault_collateral" * ("current_price") AS "collateral_value",
    "vault_collateral" * ("current_price") - "vault_debt" AS "net_value",
    "vault_debt" * "liquidation_penalty" AS "liquidation_value",
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

