-- CreateEnum
CREATE TYPE "VaultType" AS ENUM ('REGULAR', 'MULTIPLY');

-- CreateTable
CREATE TABLE "Vault" (
    "vaultId" INTEGER NOT NULL,
    "type" "VaultType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vault.vaultId_unique" ON "Vault"("vaultId");
