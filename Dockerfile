FROM node:12.16.3

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .
RUN yarn --no-progress --non-interactive --frozen-lockfile

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
