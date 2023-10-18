FROM node:18.18-alpine
EXPOSE 3000
COPY server/database /app/server/database
WORKDIR /app/server/database
RUN npm install --ignore-scripts
WORKDIR /app
COPY .next/static /app/.next/static
COPY .next/standalone /app/.next/standalone
COPY package.json yarn.lock next.config.js /app
COPY public /app/public

CMD [ "node", ".next/standalone/server.js" ]