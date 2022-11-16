CREATE TABLE "feature_flag" (
    "id" SERIAL NOT NULL,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);