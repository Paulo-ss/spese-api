FROM node:lts-slim

WORKDIR /home/spese-api

COPY . .

RUN npm install -g @nestjs/cli
RUN npm install