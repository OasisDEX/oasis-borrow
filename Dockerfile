FROM node:12.20.0

EXPOSE 3000

COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
COPY ./server/ /usr/src/app/server

WORKDIR /usr/src/app

RUN apt update && apt-get install -y libudev-dev && apt-get install libusb-1.0-0
RUN yarn --no-progress --non-interactive --frozen-lockfile

ARG COMMIT_SHA
ARG API_HOST
ARG MIXPANEL_ENV
ARG MIXPANEL_KEY
ARG SHOW_BUILD_INFO
ARG ETHERSCAN_API_KEY
ARG BLOCKNATIVE_API_KEY
ARG INFURA_PROJECT_ID

ENV COMMIT_SHA=$COMMIT_SHA \
    API_HOST=$API_HOST \
    MIXPANEL_ENV=$MIXPANEL_ENV \
    MIXPANEL_KEY=$MIXPANEL_KEY \
    ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY \
    BLOCKNATIVE_API_KEY=$BLOCKNATIVE_API_KEY \
    INFURA_PROJECT_ID=$INFURA_PROJECT_ID \
    USE_TERMS_OF_SERVICE=1 \
    SHOW_BUILD_INFO=$SHOW_BUILD_INFO

COPY . .

RUN chmod +x ./scripts/wait-for-it.sh \
    && npm run build

CMD [ "npm", "run", "start:prod" ]
