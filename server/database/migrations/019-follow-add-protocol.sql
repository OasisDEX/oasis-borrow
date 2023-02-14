CREATE TYPE "protocol" AS ENUM ('maker', 'aavev2', 'aavev3', 'ajna');

ALTER TABLE "users_who_follow_vaults"
ADD COLUMN "protocol" "protocol";

UPDATE "users_who_follow_vaults"
SET
    "protocol" = 'maker'
ALTER TABLE "users_who_follow_vaults"
ALTER column "protocol"
SET
    NOT NULL;