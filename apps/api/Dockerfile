FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN npm install

COPY apps/api ./apps/api
COPY apps/api ./apps/api

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]