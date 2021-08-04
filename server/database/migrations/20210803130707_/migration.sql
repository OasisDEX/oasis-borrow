-- CreateTable
CREATE TABLE "migrations" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tos_approval" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "doc_version" TEXT NOT NULL,
    "sign_date" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "migrations.name_unique" ON "migrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tos_approval_unique_signature" ON "tos_approval"("address", "doc_version");
