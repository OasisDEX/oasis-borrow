DELETE FROM users_who_follow_vaults WHERE "protocol" = 'aavev2';
DELETE FROM users_who_follow_vaults WHERE "protocol" = 'aavev3';
DELETE FROM users_who_follow_vaults WHERE "protocol" = 'ajna';

ALTER TABLE "users_who_follow_vaults" 
ADD COLUMN     "proxy" TEXT,
ADD COLUMN     "strategy" TEXT;

ALTER TABLE "users_who_follow_vaults"
ADD CONSTRAINT "proxy_and_strategy_not_null_for_aavev2_aavev3"
CHECK (protocol NOT IN ('aavev2', 'aavev3') OR (proxy IS NOT NULL AND strategy IS NOT NULL));