ALTER TABLE "vault"
DROP CONSTRAINT IF EXISTS "vault_vault_id_chain_id_protocol_unique_constraint";

ALTER TABLE "vault"
ADD COLUMN token_pair VARCHAR(32) NOT NULL DEFAULT '';

ALTER TABLE "vault"
ADD CONSTRAINT "vault_vault_id_chain_id_protocol_token_pair_unique_constraint"
UNIQUE ("vault_id", "chain_id", "protocol", "token_pair");
