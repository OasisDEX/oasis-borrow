ALTER TABLE "public"."vault" ADD CONSTRAINT "vault_vault_id_chain_id_unique_constraint" UNIQUE (vault_id, chain_id);
