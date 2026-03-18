# Currency Crawler — Migration Spec

## Goal

Migrate from Create React App + Express to a unified Next.js project. Remove the separate `api/` and `client/` directories in favor of a single Next.js application that handles both frontend rendering and API routes.

## Tech Stack

| Layer        | Current                        | New                                  |
|-------------|-------------------------------|--------------------------------------|
| Framework   | CRA (React 18) + Express 4    | Next.js 16 (App Router, React 19)    |
| Language    | TypeScript 4.7                | TypeScript (latest)                  |
| Styling     | Plain CSS                     | Tailwind CSS                         |
| Caching     | node-cache (in-memory, TTL)   | Next.js fetch cache (revalidation)   |
| Scraping    | Puppeteer + remote Chromium   | Puppeteer + remote Chromium (unchanged) |
| Testing     | React Testing Library         | Vitest                               |
| Pkg Manager | npm                           | pnpm                                 |
| Node.js     | 16                            | 22 LTS                               |
| Build       | react-scripts + tsc           | next build (standalone output)       |

## Architecture

### Project Structure (Unified)

```
currency-crawler/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (dark theme, fonts)
│   │   ├── page.tsx                # Main dashboard page
│   │   ├── api/
│   │   │   └── rates/
│   │   │       └── [symbols]/
│   │   │           └── route.ts    # GET /api/rates/:symbols
│   │   └── globals.css             # Tailwind imports
│   ├── components/                 # React components
│   ├── lib/
│   │   ├── repositories/
│   │   │   ├── nbp-rates.ts        # NBP API client
│   │   │   └── forex-rates.ts      # TradingView scraper
│   │   ├── helpers/
│   │   │   ├── dates.ts            # Date utilities
│   │   │   ├── formatters.ts       # Currency formatting
│   │   │   ├── change-calculator.ts # Percentage change
│   │   │   └── validators.ts       # Response validation
│   │   └── logger.ts               # Winston logger
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── public/                         # Static assets, favicons
├── __tests__/                      # Vitest test files
├── next.config.ts                  # Next.js config (standalone output)
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── Dockerfile
├── docker-compose.yaml
└── .env
```

### Data Flow

1. Client loads the Next.js page (server-rendered initial HTML)
2. Client-side JavaScript polls `GET /api/rates/USD,EUR` every **10 seconds**
3. The API route handler:
   - Fetches NBP rates from `api.nbp.pl` (cached via Next.js fetch with revalidation until end-of-day)
   - Scrapes TradingView forex rates via Puppeteer connected to remote Chromium (cached similarly)
   - Returns combined response
4. Client updates the UI with rate data and trend indicators

### API Route

**`GET /api/rates/[symbols]`**

Request: `/api/rates/USD,EUR`

Response:
```json
[
  {
    "code": "USD",
    "nbpRate": 4.2345,
    "forexRate": 4.2567
  },
  {
    "code": "EUR",
    "nbpRate": 4.5678,
    "forexRate": 4.5890
  }
]
```

## Data Sources

### NBP (National Bank of Poland)
- Endpoint: `http://api.nbp.pl/api/exchangerates/tables/A/{date}`
- Provides official daily mid rates (weekdays only)
- Weekend logic: use last Friday's rates on Saturday/Sunday
- Cache: revalidate at end-of-day

### TradingView (Forex Market Rates)
- Source: TradingView embed widget
- Method: Puppeteer scraping via remote Chromium container (WebSocket, port 9222)
- Symbols: `FOREXCOM:USDPLN`, `FOREXCOM:EURPLN`
- Fallback: return cached rates if scraping returns zeros
- Cache: revalidate at end-of-day

### Currencies
- USD → PLN
- EUR → PLN
- No configurability needed; hardcoded pairs

## UI Requirements

### Design Direction
- **Modernize slightly**: improve typography, spacing, and responsiveness over current design
- **Keep**: dark theme (black background), colored trend indicators
- **Styling**: Tailwind CSS utility classes
- **Layout**: centered, responsive dashboard

### Visual Elements
- Currency code label
- Forex rate (formatted as PLN, 4 decimal places, `pl-PL` locale)
- Trend indicator: green for rate increase, red for decrease
- Percentage change: forex rate vs NBP rate (spread indicator)
- Smooth transitions on rate updates

### Error / Stale State
- When fetch fails: display last known rates with a visual "stale" indicator (e.g., muted colors, timestamp, or badge)
- Initial load: show a loading skeleton or spinner (replace current React logo)

## Docker

### Containers (2)

1. **Next.js App** (Node 22 Alpine)
   - Standalone output mode for minimal image size (~100MB)
   - Serves both frontend and API
   - Env: `CHROMIUM_URL` (WebSocket URL to Chromium container)

2. **Chromium** (zenika/alpine-chrome or equivalent)
   - Headless browser for TradingView scraping
   - Port 9222 (Chrome DevTools Protocol)
   - Health check via HTTP endpoint

### Removed
- **nginx** container — no longer needed; Next.js serves everything directly

### docker-compose.yaml
- 2 services: `app`, `chromium`
- Shared network
- `CHROMIUM_URL` env var passed to app container
- Health checks on both containers

## Configuration

| Variable       | Default                    | Description                     |
|---------------|---------------------------|---------------------------------|
| `CHROMIUM_URL` | `http://chromium:9222`    | WebSocket URL to Chromium instance |

Minimal configuration. No additional env vars needed.

## Testing

- **Framework**: Vitest
- **Scope**: Unit tests for helper/utility functions
  - `formatters.ts` — currency formatting
  - `change-calculator.ts` — percentage change calculation
  - `dates.ts` — weekend/weekday logic, TTL calculation
  - `validators.ts` — response validation

## Migration Steps (High Level)

1. Initialize new Next.js 16 project with pnpm, TypeScript, Tailwind CSS, App Router
2. Port API logic: create route handler at `app/api/rates/[symbols]/route.ts`
3. Port data repositories (NBP + forex) to `lib/repositories/`, replacing node-cache with Next.js fetch cache
4. Port frontend: rebuild dashboard page with Tailwind CSS
5. Port helpers and types to `lib/`
6. Add stale data indicator and loading state
7. Write Vitest unit tests for helpers
8. Create new Dockerfile (multi-stage, standalone output) and docker-compose.yaml
9. Remove old `api/`, `client/`, nginx config, and CRA-related files
10. Verify end-to-end: docker compose up, confirm rates display correctly

## Out of Scope

- Additional currency pairs
- Database or persistent storage
- Authentication
- SSE or WebSocket push (keep polling)
- CI/CD pipeline changes
- Configurable poll interval or log level
