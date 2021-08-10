-- CreateEnum
CREATE TYPE "VaultType" AS ENUM ('BORROW', 'MULTIPLY');

-- CreateTable
CREATE TABLE "Vault" (
    "vaultId" INTEGER NOT NULL,
    "type" "VaultType" NOT NULL,
    "proxyAddres" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vault.vaultId_unique" ON "Vault"("vaultId");
