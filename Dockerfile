FROM node:18.18-alpine AS builder
WORKDIR /usr/src/app
RUN apk add --no-cache --virtual python make g++ gcc

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/yarn.lock
COPY ./server/ /usr/src/app/server
COPY ./.next/cache/ /usr/src/app/.next/cache
COPY ./scripts/get-config-types.js /usr/src/app/scripts/get-config-types.js
COPY ./blockchain/abi/*.json /usr/src/app/blockchain/abi/


ARG CONFIG_URL=''
ENV CONFIG_URL=$CONFIG_URL
RUN yarn --no-progress --non-interactive --frozen-lockfile
ARG COMMIT_SHA='' \
  NOTIFICATIONS_HOST='' \
  NOTIFICATIONS_HOST_GOERLI='' \
  AJNA_SUBGRAPH_URL='' \
  AJNA_SUBGRAPH_URL_GOERLI='' \
  AJNA_SUBGRAPH_V2_URL='' \
  AJNA_SUBGRAPH_V2_URL_GOERLI='' \
  MIXPANEL_ENV='' \
  MIXPANEL_KEY='' \
  ADROLL_ADV_ID='' \
  ADROLL_PIX_ID='' \
  MAINNET_CACHE_URL='' \
  SHOW_BUILD_INFO='' \
  ETHERSCAN_API_KEY='' \
  BLOCKNATIVE_API_KEY='' \
  INFURA_PROJECT_ID='' \
  NODE_ENV='' \
  NEXT_PUBLIC_SENTRY_ENV='' \
  SENTRY_AUTH_TOKEN='' \
  PRODUCT_HUB_KEY='' \
  ONE_INCH_API_KEY='' \
  ONE_INCH_API_URL='' \
  REFERRAL_SUBGRAPH_URL=''

ENV COMMIT_SHA=$COMMIT_SHA \
  NOTIFICATIONS_HOST=$NOTIFICATIONS_HOST \
  NOTIFICATIONS_HOST_GOERLI=$NOTIFICATIONS_HOST_GOERLI \
  AJNA_SUBGRAPH_URL=$AJNA_SUBGRAPH_URL \
  AJNA_SUBGRAPH_URL_GOERLI=$AJNA_SUBGRAPH_URL_GOERLI \
  AJNA_SUBGRAPH_V2_URL=$AJNA_SUBGRAPH_V2_URL \
  AJNA_SUBGRAPH_V2_URL_GOERLI=$AJNA_SUBGRAPH_V2_URL_GOERLI \
  MIXPANEL_ENV=$MIXPANEL_ENV \
  MIXPANEL_KEY=$MIXPANEL_KEY \
  ADROLL_ADV_ID=$ADROLL_ADV_ID \
  ADROLL_PIX_ID=$ADROLL_PIX_ID \
  MAINNET_CACHE_URL=$MAINNET_CACHE_URL \
  ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY \
  BLOCKNATIVE_API_KEY=$BLOCKNATIVE_API_KEY \
  INFURA_PROJECT_ID=$INFURA_PROJECT_ID \
  USE_TERMS_OF_SERVICE=1 \
  USE_TRM_API=1 \
  SHOW_BUILD_INFO=$SHOW_BUILD_INFO \
  NODE_ENV=$NODE_ENV \
  SENTRY_RELEASE=$COMMIT_SHA \
  NEXT_PUBLIC_SENTRY_ENV=$NEXT_PUBLIC_SENTRY_ENV \
  SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \
  PRODUCT_HUB_KEY=$PRODUCT_HUB_KEY \
  ONE_INCH_API_KEY=$ONE_INCH_API_KEY \
  ONE_INCH_API_URL=$ONE_INCH_API_URL \
  REFERRAL_SUBGRAPH_URL=$REFERRAL_SUBGRAPH_URL \
  NODE_OPTIONS=--max-old-space-size=6144


COPY . .
RUN yarn build
RUN apk del .gyp



FROM node:18.18-alpine AS runner
EXPOSE 3000
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/yarn.lock .
COPY --from=builder /usr/src/app/next.config.js .
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/server/database/migrate.ts ./server/database
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static

CMD [ "yarn", "start:prod" ]