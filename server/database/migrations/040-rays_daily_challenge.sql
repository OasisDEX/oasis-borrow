CREATE TABLE "rays_daily_challenge" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "claimed_dates" TEXT[],

    CONSTRAINT "rays_daily_challenge_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "rays_daily_challenge_address_key" ON "rays_daily_challenge"("address");