FROM node:12.20.0

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .
RUN apt update && apt-get install -y libudev-dev && apt-get install libusb-1.0-0 && yarn upgrade
RUN yarn --no-progress --non-interactive --frozen-lockfile

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
