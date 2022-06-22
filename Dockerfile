FROM zenika/alpine-chrome:latest as chromium
USER root
RUN apk upgrade --no-cache --available \
    && apk add --no-cache \
    curl
USER chrome
CMD [ "chromium-browser", "--headless", "--disable-gpu", "--no-sandbox", "--remote-debugging-port=9222", "--remote-debugging-address=0.0.0.0", "about:blank" ]

FROM node:16-alpine as api
WORKDIR /app
COPY api/package.json api/package-lock.json ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm install
COPY api/ .
RUN npm run build
CMD ["npm", "start"]

FROM node:16-alpine as client_builder
WORKDIR /app
COPY client/package.json client/package-lock.json /app/
RUN npm install
COPY client/ .
RUN npm run build

FROM nginx as nginx
COPY --from=client_builder /app/build /usr/share/nginx/html
COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
