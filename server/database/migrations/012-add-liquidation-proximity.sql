DROP VIEW "largest_debt";

CREATE VIEW "largest_debt" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    ("vault_normalized_debt" * "rate") AS "vault_debt",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") - "liquidation_ratio" AS "liquidation_proximity",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") AS "coll_ratio",
    "last_action",
    "type"
FROM
    "discover_with_coll_data";

