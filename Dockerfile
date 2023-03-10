FROM node:bullseye as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install
ADD . .
RUN npm run test
RUN npm run test:e2e
RUN npm run build

FROM node:bullseye
WORKDIR /opt/app
ADD package.json ./
RUN npm install --omit=dev
COPY --from=build /opt/app/dist ./dist
EXPOSE 5000
ENV NODE_ENV=test
CMD ["node", "./dist/src/main.js"]