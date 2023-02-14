CREATE TYPE "protocol" AS ENUM ('maker', 'aave', 'ajna');

ALTER TABLE "users_who_follow_vaults"
ADD COLUMN "protocol" "protocol";
ADD COLUMN "version" text;

UPDATE "users_who_follow_vaults"
SET
    "protocol" = 'maker'
ALTER TABLE "users_who_follow_vaults"
ALTER column "protocol"
SET
    NOT NULL;

ALTER TABLE "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_pkey" PRIMARY KEY (
    "user_address",
    "vault_id",
    "vault_chain_id",
    "protocol"
);