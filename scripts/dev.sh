#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Starting dependencies..."
docker-compose down
docker rm -f postgres-oasis-borrow || true
docker rm -f multiply-proxy-actions || true
docker rm -f oasis-borrow || true

docker-compose pull
(sleep 10 && cd .. && DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public" yarn migrate)&

docker-compose --env-file ../.env up
