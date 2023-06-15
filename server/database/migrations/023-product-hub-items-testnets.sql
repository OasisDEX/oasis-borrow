CREATE TYPE "networkWithTestnets" AS ENUM ('ethereum', 'ethereum_goerli', 'arbitrum', 'arbitrum_goerli', 'polygon', 'polygon_mumbai', 'optimism', 'optimism_goerli');

ALTER TABLE "product_hub_items"
ALTER COLUMN "network" TYPE "networkWithTestnets"
USING ("network"::text::"networkWithTestnets")
