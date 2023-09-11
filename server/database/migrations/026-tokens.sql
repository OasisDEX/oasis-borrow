-- CreateTable
CREATE TABLE "tokens" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "precision" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_address_chain_id_key" ON "tokens" ("address", "chain_id");
