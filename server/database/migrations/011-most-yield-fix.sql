DROP VIEW "most_yield";

CREATE VIEW "most_yield" AS
SELECT "protocol_id",
    "position_id",
    "collateral_type",
    "vault_collateral" * ("current_price") as "collateral_value",
    "vault_collateral" * ("current_price") - "vault_debt" as "net_value",
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