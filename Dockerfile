FROM node:20-alpine
EXPOSE 3000
WORKDIR /app
# these are required for the app to start in standalone mode
COPY package.json yarn.lock next.config.js /app
COPY public /app/public
COPY scripts/get-config-types.js /app/scripts
COPY server/database/migrate.ts /app/server/database/migrate.ts
COPY .next/standalone /app
COPY .next/static /app/.next/static


CMD [ "yarn", "start:prod" ]