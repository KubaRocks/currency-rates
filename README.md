# Currency Crawler

Minimal currency display for a Raspberry Pi screen.

The app is now a single Next.js project that serves both:

- the fullscreen UI at `/`
- the rates API at `/api/rates/USD,EUR`

It fetches:

- official NBP rates
- live forex rates scraped from TradingView through a remote Chromium instance

When live scraping fails, the API returns the last known combined payload marked as stale instead of dropping the display to empty state.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vitest
- Puppeteer
- Docker Compose

## Requirements

- Node.js 22
- pnpm 10
- Docker Desktop or another working Docker daemon for containerized runs

## Install

```bash
pnpm install
```

## Run Locally

The app itself runs with:

```bash
pnpm dev
```

By default the API route expects a Chromium endpoint at:

```bash
http://chromium:9222
```

That means `pnpm dev` is enough for UI work, helper tests, and build checks, but the live forex scraping path needs a reachable Chromium service. The easiest way to run the full stack is Docker Compose.

If you want to run the Next app locally while using a separately started Chromium instance, set:

```bash
CHROMIUM_URL=http://127.0.0.1:9222 pnpm dev
```

## Run With Docker

Start both the app and the Chromium service:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:3000
```

To expose the app on a different host port, override `APP_PORT`:

```bash
APP_PORT=8080 docker compose up --build
```

Then open:

```text
http://localhost:8080
```

The Compose setup starts:

- `app`: Next.js app
- `chromium`: headless browser used by Puppeteer

Stop the stack with:

```bash
docker compose down
```

## Scripts

```bash
pnpm dev
pnpm test
pnpm build
pnpm start
```

## API

### `GET /api/rates/USD,EUR`

Example response:

```json
{
  "rates": [
    {
      "code": "USD",
      "nbpRate": 4.2345,
      "forexRate": 4.2567
    },
    {
      "code": "EUR",
      "nbpRate": 4.5678,
      "forexRate": 4.589
    }
  ],
  "stale": false,
  "updatedAt": "2026-03-18T12:00:00.000Z",
  "sources": {
    "nbp": "fresh",
    "forex": "fresh"
  }
}
```

Supported symbols are hardcoded to:

- `USD`
- `EUR`

If unsupported symbols are requested, the route returns `400`.

## Testing

Run the unit test suite:

```bash
pnpm test
```

The current tests cover:

- money and percentage formatting
- spread calculation
- date helpers
- payload validation
- stale fallback service logic
- route handler validation

## Production Build

Create a production build locally:

```bash
pnpm build
```

Run the production server:

```bash
pnpm start
```

## Project Structure

```text
src/
  app/
    api/rates/[symbols]/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    rate-row.tsx
    rates-screen.tsx
  lib/
    cache.ts
    helpers/
    logger.ts
    repositories/
  types/
    index.ts
__tests__/
public/
Dockerfile
docker-compose.yaml
```

## Notes

- The UI is intentionally minimal and optimized for a small attached display.
- Strong cyan and magenta tones are used because the target panel has weak color reproduction.
- Docker build and runtime verification require a running Docker daemon.
