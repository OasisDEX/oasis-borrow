#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Starting dependencies..."
docker rm -f postgres-oasis-borrow || true
docker-compose down
(sleep 10 && cd .. && yarn migrate)&
docker-compose up
