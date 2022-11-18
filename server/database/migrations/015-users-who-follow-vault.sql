CREATE TABLE
    "users_who_follow_vaults" (
        "user_address" TEXT NOT NULL,
        "vault_id" INTEGER NOT NULL,
        "tos_doc_version" TEXT NOT NULL,
        "vault_chain_id" INTEGER NOT NULL,
        CONSTRAINT "users_who_follow_vaults_pkey" PRIMARY KEY ("user_address", "vault_id", "vault_chain_id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "tos_approval_address_chain_id_doc_version_key" ON "tos_approval" ("address", "chain_id", "doc_version");

-- AddForeignKey
ALTER TABLE
    "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_user_address_vault_chain_id_tos_do_fkey" FOREIGN KEY (
        "user_address",
        "vault_chain_id",
        "tos_doc_version"
    ) REFERENCES "tos_approval" ("address", "chain_id", "doc_version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_vault_id_vault_chain_id_fkey" FOREIGN KEY ("vault_id", "vault_chain_id") REFERENCES "vault" ("vault_id", "chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;