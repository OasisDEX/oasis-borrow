CREATE TYPE "vault_type" AS ENUM ('borrow', 'multiply');

CREATE TABLE "vault" (
    "vault_id" INTEGER NOT NULL,
    "type" "vault_type" NOT NULL,
    "owner_address" CHAR(42) NOT NULL
);

CREATE UNIQUE INDEX "vault.vault_id_unique" ON "vault"("vault_id");