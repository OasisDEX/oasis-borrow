FROM node:12.20.0

EXPOSE 3000

ARG COMMIT_SHA
ARG MIXPANEL_ENV
ARG MIXPANEL_KEY
ENV MIXPANEL_ENV=$MIXPANEL_ENV
ENV MIXPANEL_KEY=$MIXPANEL_KEY

WORKDIR /usr/src/app

COPY . .
RUN apt update && apt-get install -y libudev-dev && apt-get install libusb-1.0-0
RUN yarn --no-progress --non-interactive --frozen-lockfile

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
