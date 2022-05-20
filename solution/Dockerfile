FROM node:14-alpine3.12

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

EXPOSE 3000

CMD [ "npm", "run", "start"]