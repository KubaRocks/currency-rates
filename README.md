# Currency Crawler

Minimal currency display for a Raspberry Pi screen.

The app is now a single Next.js project that serves both:

- the fullscreen UI at `/`
- the rates API at `/api/rates/USD,EUR`
- the version endpoint at `/api/version`

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

For local development with Docker Compose, the override file exposes Chromium on the host as well. That lets you run only the browser container and keep the Next app on your machine:

```bash
docker compose up chromium
CHROMIUM_URL=http://127.0.0.1:9222 pnpm dev
```

You can override the host Chromium port if needed:

```bash
CHROMIUM_PORT=9333 docker compose up chromium
CHROMIUM_URL=http://127.0.0.1:9333 pnpm dev
```

## Pi Display Target

The attached Raspberry Pi display is `800x480`, and UI work should always be evaluated against that target first. Desktop browser previews are useful for iteration, but the primary design constraint for layout, spacing, typography, and safe margins is the `800x480` panel.

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
make version
make next-version
make release
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

### `GET /api/version`

Example response:

```json
{
  "version": "v2026.03.19.2"
}
```

The Pi client polls this endpoint periodically and performs a full page reload when the reported version changes.

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
- versioning helpers and version route

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
VERSION
Makefile
```

## Notes

- The UI is intentionally minimal and optimized for a small attached display.
- The display uses deliberately over-saturated cyan and red because the target panel washes colors out.
- Docker build and runtime verification require a running Docker daemon.

## Releases

The app version lives in the root `VERSION` file.

Format:

- first release of a day: `v2026.03.19`
- later releases on the same day: `v2026.03.19.2`, `v2026.03.19.3`, and so on

Helpers:

```bash
make version
make next-version
make release
```

`make release`:

- queries GitHub releases for today and computes the next version from remote release state
- updates `VERSION`
- commits the change
- pushes the current branch
- creates and pushes a matching git tag
- creates a GitHub release with `gh`
