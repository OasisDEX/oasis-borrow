ALTER TABLE discover
    ADD COLUMN "net_profit_all" DECIMAL(65, 30),
    ADD COLUMN "net_profit_1d" DECIMAL(65, 30),
    ADD COLUMN "net_profit_7d" DECIMAL(65, 30),
    ADD COLUMN "net_profit_30d" DECIMAL(65, 30),
    ADD COLUMN "net_profit_365d" DECIMAL(65, 30),
    ADD COLUMN "net_profit_ytd" DECIMAL(65, 30);

DROP VIEW highest_pnl;

CREATE VIEW "highest_pnl" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / ("vault_collateral" * ("current_price") - ("vault_normalized_debt" * "rate")) AS "vault_multiple",
    "net_profit_all" AS "pnl_all",
    "net_profit_1d" AS "pnl_1d",
    "net_profit_7d" AS "pnl_7d",
    "net_profit_30d" AS "pnl_30d",
    "net_profit_365d" AS "pnl_365d",
    "net_profit_ytd" AS "pnl_ytd",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

