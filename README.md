# Log Viewer Foundation

Log Viewer is a TypeScript + React application for importing, exploring, and filtering log files with parser-aware recovery for malformed continuation lines.

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates an optimized production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the repository.
- `npm run format` formats the repository with Prettier.
- `npm run test` runs the Vitest unit suite.
- `npm run test:ui` opens the Vitest UI.
- `npm run test:e2e` runs the Playwright browser suite.

## Architecture

The application uses a layered structure:

- `src/app` for root layout components such as `AppShell`.
- `src/pages` for page-level screens such as `HomePage`.
- `src/store` for shared application state with Zustand.
- `src/core/models` and `src/core/parsers` for domain contracts.
- `src/filters` for pure client-side filtering functions.
- `src/styles` for global styling and theme tokens.
- `docs/adr` for architecture decisions that should remain stable over time.

## Filtering Workflow

After importing a file, use the filter toolbar to:

- Search message text while keeping logger/severity/time filters intact.
- Select one or more logger names.
- Set a minimum severity threshold.
- Apply relative or custom time windows anchored to the imported dataset.
- Recover quickly from empty results with a clear-filters action.

The filtering architecture decision is documented in [docs/adr/0003-client-side-filtering.md](docs/adr/0003-client-side-filtering.md).

## Validation Notes

- Vite provides fast reloads during development and an optimized production build.
- The production build is tree-shaken and minified by default.
- Playwright browsers must be installed with `npx playwright install` before running E2E tests on a fresh machine.
- Browser validation confirms the shell layout renders in both the development and preview servers.

## Testing

- Unit tests live alongside source files or under `tests/unit`.
- E2E tests live under `tests/e2e`.
- Use `npm run test` for unit-level feedback and `npm run test:e2e` for browser coverage.

## Large Fixture Generation

Generate a deterministic 50,000-entry log fixture for responsiveness checks:

```bash
node tests/e2e/fixtures/generate-large-log.mjs
```

This writes `tests/e2e/fixtures/logs/synthetic_50000.log`.
