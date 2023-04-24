DROP VIEW "high_risk";

CREATE VIEW "high_risk" AS
SELECT
    "protocol_id",
    "position_id",
    "collateral_type",
    "token",
    "vault_collateral" * "current_price" AS "collateral_value",
    "vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") AS "collateral_ratio",
    ("vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate") - "liquidation_ratio") / ("vault_collateral" * "current_price" / ("vault_normalized_debt" * "rate")) AS "liquidation_proximity",
    "liquidation_ratio" * ("vault_normalized_debt" * "rate") / "vault_collateral" AS "liquidation_price",
    "next_price",
    ("vault_normalized_debt" * "rate") * "liquidation_penalty" AS "liquidation_value",
    "status",
    "type"
FROM
    "discover_with_coll_data";

