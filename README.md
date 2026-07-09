# Log Viewer Foundation

Log Viewer is a TypeScript + React application foundation for inspecting log files, rendering a consistent app shell, and providing the domain types and tooling needed for future feature work.

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
- `src/styles` for global styling and theme tokens.

## Validation Notes

- Vite provides fast reloads during development and an optimized production build.
- The production build is tree-shaken and minified by default.
- Playwright browsers must be installed with `npx playwright install` before running E2E tests on a fresh machine.
- Browser validation confirms the shell layout renders in both the development and preview servers.

## Testing

- Unit tests live alongside source files or under `tests/unit`.
- E2E tests live under `tests/e2e`.
- Use `npm run test` for unit-level feedback and `npm run test:e2e` for browser coverage.
