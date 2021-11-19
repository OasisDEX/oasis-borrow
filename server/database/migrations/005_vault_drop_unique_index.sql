update vault set chain_id = 1 where chain_id is null;
DROP INDEX public."vault.vault_id_unique";