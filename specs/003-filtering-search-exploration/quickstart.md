# Quickstart: Filtering, Search, and Exploration

## Prerequisites

- Node.js environment compatible with the existing Vite application
- Project dependencies installed with `npm install`
- A log file that can already be imported through the current log-import workflow

## Setup

1. Start the application with `npm run dev`
2. Open the local app in a browser
3. Import a log file with enough entries to exercise logger, severity, and time-based filtering

## Validation Scenarios

### Scenario 1: Message Search

1. Import a dataset containing multiple messages with a shared word fragment
2. Enter a search term in the message-search field
3. Confirm that only entries whose message contains the term remain visible
4. Confirm that the result summary updates to the visible-versus-total entry count
5. Clear the search term and confirm the broader result set is restored
6. Confirm that clearing search text does not clear logger, severity, or time filters that remain active

### Scenario 2: Combined Filters

1. Import a dataset containing multiple logger names and severity levels
2. Select one or more logger values
3. Set the minimum severity to `WARNING` or higher
4. Select a relative time window
5. Enter a message-search term that appears in only some of the remaining rows
6. Confirm that every visible entry matches all active filters simultaneously

### Scenario 3: Relative and Custom Time Windows

1. Import a historical dataset with a known newest timestamp
2. Select `Last Hour` and confirm only entries from the final hour of the dataset remain visible
3. Switch to a custom range and choose a valid start and end time within the dataset span
4. Confirm only entries inside the custom range remain visible
5. Enter an invalid custom range where the start is after the end and confirm the application clearly rejects it while preserving the last valid result set

### Scenario 4: Empty Results Recovery

1. Apply filters that intentionally exclude all rows
2. Confirm the application shows an empty-results state rather than appearing broken
3. Use the clear-filters action
4. Confirm the full imported dataset becomes visible again without re-importing the file

### Scenario 5: New Import Reset Behavior

1. Import a dataset and activate multiple filters
2. Import a different file
3. Confirm all filters reset to their default values before the new dataset is shown

### Scenario 6: Large Dataset Responsiveness

1. Generate a dataset containing at least 50,000 entries using `node tests/e2e/fixtures/generate-large-log.mjs`
2. Import `tests/e2e/fixtures/logs/synthetic_50000.log`
2. Apply message, logger, severity, and time filters in ordinary investigation workflows
3. Confirm the interface remains subjectively responsive while counts and visible rows continue updating correctly
4. Record the dataset source and validation notes in this quickstart file after implementation

## Verification Commands

- Run unit and component tests with `npm run test`
- Run browser workflow tests with `npm run test:e2e`
- Run the production build with `npm run build`

## Expected Outcomes

- Filter controls remain understandable without requiring query syntax
- Visible-entry counts update whenever filters change
- Combined filters narrow the imported dataset correctly
- Historical time windows behave relative to the dataset’s newest timestamp
- Search clear removes only the message search while preserving other active filters
- Invalid custom ranges are clearly rejected without breaking the current view
- Large dataset validation is documented with a 50,000-entry test source
- Empty results are recoverable without re-importing the file

## Validation Log

The following implementation checks were run for this feature slice:

- `npx vitest run src/filters/applyFilters.test.ts src/filters/filterByTime.test.ts src/store/logFilterStore.test.ts src/filters/getLoggerOptions.test.ts src/store/logImportStore.test.ts src/pages/HomePage.test.tsx src/app/AppShell.smoke.test.tsx`
- `npx playwright test tests/e2e/filtering-combined.spec.ts tests/e2e/filtering-time.spec.ts tests/e2e/filtering-empty-state.spec.ts --reporter=line`
- `node tests/e2e/fixtures/generate-large-log.mjs`
- `npx playwright test tests/e2e/filtering-large-dataset.spec.ts --project=chromium --reporter=line`

Large-dataset check notes:

- Fixture source: `tests/e2e/fixtures/logs/synthetic_50000.log` (generated)
- Validation flow: imported fixture, applied message/logger/severity/time combinations, confirmed that visible/total counts continued updating and clear-filters restored the full dataset