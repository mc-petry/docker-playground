FROM node:15.7-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

ENV NODE_ENV production

CMD [ "npm", "start" ]
