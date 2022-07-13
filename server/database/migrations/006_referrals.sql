-- CreateTable
CREATE TABLE "user" (
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_that_referred_address" TEXT,
    "total_amount" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "weekly_claim" (
    "id" SERIAL NOT NULL,
    "week_number" INTEGER NOT NULL,
    "user_address" TEXT NOT NULL,
    "proof" TEXT[],
    "amount" TEXT NOT NULL,

    CONSTRAINT "weekly_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merkle_tree" (
    "week_number" INTEGER NOT NULL,
    "tree_root" TEXT NOT NULL
);


-- CreateIndex
CREATE UNIQUE INDEX "user_address_key" ON "user"("address");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_claim_week_number_user_address_key" ON "weekly_claim"("week_number", "user_address");

-- CreateIndex
CREATE UNIQUE INDEX "merkle_tree_week_number_key" ON "merkle_tree"("week_number");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_user_that_referred_address_fkey" FOREIGN KEY ("user_that_referred_address") REFERENCES "user"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_claim" ADD CONSTRAINT "weekly_claim_user_address_fkey" FOREIGN KEY ("user_address") REFERENCES "user"("address") ON DELETE RESTRICT ON UPDATE CASCADE;