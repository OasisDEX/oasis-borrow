CREATE TABLE "users_who_follow_vaults" (
    "user_address" TEXT NOT NULL,
    "vault_id" INTEGER NOT NULL,
    "vault_type" "vault_type" NOT NULL,

    CONSTRAINT "users_who_follow_vaults_pkey" PRIMARY KEY ("user_address","vault_id","vault_type")
);
-- CreateIndex
CREATE UNIQUE INDEX "vault_vault_id_key" ON "vault"("vault_id");
CREATE UNIQUE INDEX "vault_vault_id_type_key" ON "vault"("vault_id", "type");
-- AddForeignKey
ALTER TABLE "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_vault_id_vault_type_fkey" FOREIGN KEY ("vault_id", "vault_type") REFERENCES "vault"("vault_id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "users_who_follow_vaults" ADD CONSTRAINT "users_who_follow_vaults_user_address_fkey" FOREIGN KEY ("user_address") REFERENCES "user"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
