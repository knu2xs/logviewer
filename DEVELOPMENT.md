# Development Guide

## Local Setup

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Open `http://localhost:5173` in a browser.

## Code Quality

- Run `npm run lint` before committing changes.
- Run `npm run format` to normalize formatting across the repo.
- Keep TypeScript strict mode enabled and avoid introducing `any` unless unavoidable.

## Testing Conventions

- Put unit tests near the code they exercise or under `tests/unit`.
- Put browser tests under `tests/e2e`.
- Use `npm run test` for Vitest and `npm run test:e2e` for Playwright.
- For Playwright debugging, run with `--headed` or use the HTML report generated after a test run.

## Adding Features

- Add shared domain types in `src/core/models`.
- Add parsing contracts in `src/core/parsers`.
- Add state in `src/store` when multiple components need access.
- Add page-level UI in `src/pages` and reusable shell UI in `src/app`.
- Record major architecture decisions in `docs/adr` before implementing them.

## Build Notes

- `npm run build` compiles TypeScript and creates the optimized Vite output in `dist/`.
- The build is tree-shaken and minified by default.
- Lockfile changes can trigger Vite dependency re-optimization on the next dev server start.
