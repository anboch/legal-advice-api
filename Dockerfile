FROM node:16.17-alpine as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install
ADD . .
RUN npm run test
RUN npm run test:e2e
RUN npm run build

FROM node:16.17-alpine
WORKDIR /opt/app
ADD package.json ./
RUN npm install --omit=dev
COPY --from=build /opt/app/dist ./dist
CMD ["node", "./dist/main.js"]