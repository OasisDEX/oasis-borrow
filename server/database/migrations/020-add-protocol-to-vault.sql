ALTER TABLE "vault"
DROP CONSTRAINT IF EXISTS "vault_vault_id_chain_id_unique_constraint";

ALTER TABLE "vault"
ADD COLUMN protocol VARCHAR(32) NOT NULL DEFAULT 'maker';

ALTER TABLE "vault"
ADD CONSTRAINT "vault_vault_id_chain_id_protocol_unique_constraint"
UNIQUE ("vault_id", "chain_id", "protocol");
