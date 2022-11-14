CREATE TABLE "users_who_follow_vaults" (
    "user_address" TEXT NOT NULL,
    "vault_id" INTEGER NOT NULL,
    "vault_type" "vault_type" NOT NULL,
    "vault_chain_id" INTEGER NOT NULL,

    CONSTRAINT "users_who_follow_vaults_pkey" PRIMARY KEY ("user_address","vault_id","vault_type","vault_chain_id")
);
-- CreateIndex
CREATE UNIQUE INDEX "vault_vault_id_key" ON "vault"("vault_id");
-- CreateIndex
CREATE UNIQUE INDEX "vault_vault_id_chain_id_key" ON "vault"("vault_id", "chain_id");
-- CreateIndex
CREATE UNIQUE INDEX "vault_vault_id_type_chain_id_key" ON "vault"("vault_id", "type", "chain_id");
-- AddForeignKey
ALTER TABLE "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_vault_id_vault_type_vault_chain_id_fkey" FOREIGN KEY ("vault_id", "vault_type", "vault_chain_id") REFERENCES "vault"("vault_id", "type", "chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_user_address_fkey" FOREIGN KEY ("user_address") REFERENCES "user"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
