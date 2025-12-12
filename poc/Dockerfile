FROM node:24.12.0-alpine3.22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["sh", "./docker-start.sh"]