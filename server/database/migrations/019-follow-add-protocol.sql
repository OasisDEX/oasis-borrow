CREATE TYPE "protocol" AS ENUM ('maker', 'aavev2', 'aavev3', 'ajna');

ALTER TABLE "users_who_follow_vaults"
ADD COLUMN "protocol" "protocol";

UPDATE "users_who_follow_vaults"
SET
    "protocol" = 'maker';
   
ALTER TABLE "users_who_follow_vaults"
ALTER column "protocol"
SET
    NOT NULL;

ALTER TABLE "users_who_follow_vaults"
DROP CONSTRAINT "users_who_follow_vaults_pkey",
ADD CONSTRAINT "users_who_follow_vaults_pkey" PRIMARY KEY ("user_address", "vault_id", "vault_chain_id", "protocol");
