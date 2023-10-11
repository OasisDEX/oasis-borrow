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
# these are required for the migrations to work (on start)
COPY node_modules/ts-node /app/node_modules/ts-node
COPY node_modules/pg /app/node_modules/pg
COPY node_modules/@types/pg /app/node_modules/@types/pg
COPY node_modules/dotenv /app/node_modules/dotenv
COPY node_modules/postgres-migrations /app/node_modules/postgres-migrations


CMD [ "yarn", "start:prod" ]