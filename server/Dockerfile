FROM node:16.20.1-alpine3.17

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install
COPY ./index.js ./

CMD ["npm","start"]