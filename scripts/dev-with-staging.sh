#!/usr/bin/env bash
# This script adds an additional docker image (oasisdexorg/oasis-borrow)
# which is the version of the site running at https://staging.oasis.app
# Will be available at http://0.0.0.0:3000
./scripts/docker/launch.sh -f compose.yml -f with-staging-site.yml
