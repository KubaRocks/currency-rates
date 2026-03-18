FROM zenika/alpine-chrome:100 AS chromium
CMD [ "chromium-browser", "--single-process", "--no-zygote", "--ignore-certificate-errors", "--headless", "--disable-gpu", "--no-sandbox", "--remote-debugging-port=9222", "--remote-debugging-address=0.0.0.0", "about:blank" ]

FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS app
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Warsaw
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache wget
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
