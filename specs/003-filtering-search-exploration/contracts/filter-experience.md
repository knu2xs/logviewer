# UI Contract: Filtering, Search, and Exploration

## Purpose

Define the browser-visible behavior for the filtering controls layered onto the existing imported-log workflow.

## Control Contract

### Message Search

- Provides a single text input for filtering log messages
- Applies only to visible log message content, not logger name, timestamp, or source file
- Uses case-insensitive substring matching
- Applies after a 250ms debounce
- Includes a clear action that removes the search text and reapplies the remaining active filters

### Time Filter

- Provides the following choices:
  - `All Entries`
  - `Last 5 Minutes`
  - `Last 15 Minutes`
  - `Last 30 Minutes`
  - `Last Hour`
  - `Last 6 Hours`
  - `Last 12 Hours`
  - `Last 24 Hours`
  - `Custom Range`
- Relative windows are calculated from the newest imported timestamp
- Custom range requires a valid start and end date/time before it can affect visible results

### Logger Filter

- Provides multi-select behavior over the distinct logger names discovered in the active imported dataset
- Displays logger names with their imported casing preserved
- Sorts options alphabetically
- Uses no selection to mean “all loggers”

### Severity Filter

- Provides a single minimum-severity control with these options:
  - `NOTSET`
  - `DEBUG`
  - `INFO`
  - `WARNING`
  - `ERROR`
  - `CRITICAL`
- Selecting a minimum threshold shows that threshold plus higher standard severities
- Entries with unrecognized severity labels remain visible only when the minimum threshold is `NOTSET`

## Results Contract

- The result summary always displays visible entries versus total imported entries
- The results grid receives already-filtered rows from the application-owned pipeline
- All filter dimensions stack together using logical AND behavior
- Importing a new file resets all filter controls to their default values before new rows are shown

## Empty State Contract

- When no entries match the current filters, the application shows a dedicated empty-results state
- The empty-results state includes a clear action that restores default filter values
- The application remains functional and does not require re-importing the file to recover results