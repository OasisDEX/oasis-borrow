CREATE TYPE "protocol" AS ENUM ('AAVE', 'AJNA', 'MAKERDAO');

ALTER TABLE "users_who_follow_vaults" ADD COLUMN "protocol" protocol; 
UPDATE "users_who_follow_vaults" SET "protocol" = 'MAKERDAO';

ALTER TABLE "users_who_follow_vaults" ALTER COLUMN "protocol" SET NOT NULL;