-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_that_referred_address" TEXT,
    "total_amount" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyClaim" (
    "id" SERIAL NOT NULL,
    "week_number" INTEGER NOT NULL,
    "user_address" TEXT NOT NULL,
    "proof" TEXT[],
    "amount" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL,

    CONSTRAINT "WeeklyClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerkleTree" (
    "week_number" INTEGER NOT NULL,
    "tree_root" TEXT NOT NULL
);


-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyClaim_week_number_user_address_key" ON "WeeklyClaim"("week_number", "user_address");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleTree_week_number_key" ON "MerkleTree"("week_number");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_that_referred_address_fkey" FOREIGN KEY ("user_that_referred_address") REFERENCES "User"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyClaim" ADD CONSTRAINT "WeeklyClaim_user_address_fkey" FOREIGN KEY ("user_address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
