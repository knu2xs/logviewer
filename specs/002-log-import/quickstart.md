# Quickstart: Log Import

## Prerequisites

- Node.js installed
- Dependencies installed with `npm install`
- Playwright browsers installed if browser tests have not been run before: `npx playwright install`

## Run the app

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Validation Scenarios

### 1. Valid log file

Create a text file containing lines in one of the supported formats, then use the app to open it.

Example lines:

```text
2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token
2026-07-09 08:15:22,125 | Portal.Security | INFO | Token validation started
```

Expected result:

- The file loads successfully.
- Parsed rows appear in a grid.
- The row count reflects the number of valid lines.
- No parse errors are shown for valid lines.

### 2. Empty log file

Create an empty text file and open it in the app.

Expected result:

- The import completes without crashing.
- An empty-state message is shown.
- Row and parse-error counts remain zero.

### 3. Mixed valid and malformed lines

Create a file that mixes valid lines with malformed ones.

Expected result:

- Valid rows still appear in the grid.
- Malformed lines are reported as parse errors.
- The import session keeps row data and error data together.

## Automated Checks

```bash
npm run test
npm run test:e2e
npm run build
```

Expected result:

- Vitest passes for parser and session logic.
- Playwright passes for browser-visible import behavior.
- The production build completes successfully.