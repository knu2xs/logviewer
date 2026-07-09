# Data Model: Filtering, Search, and Exploration

## FilterState

- **Purpose**: Represents all user-controlled filter inputs for the active imported dataset.
- **Fields**:
  - `searchText: string` - current message-search input
  - `selectedLoggers: string[]` - exact imported logger values currently selected
  - `minimumLevel: MinimumSeverity` - selected severity threshold
  - `timeFilter: TimeFilter` - active relative or custom time mode
  - `customStart: Date | null` - custom range start when `timeFilter = CUSTOM`
  - `customEnd: Date | null` - custom range end when `timeFilter = CUSTOM`
- **Validation rules**:
  - `searchText` may be empty
  - `selectedLoggers` must contain unique exact logger values
  - `customStart` and `customEnd` must both be present when `timeFilter = CUSTOM`
  - `customStart` must be less than or equal to `customEnd`
- **State transitions**:
  - Initialized to defaults when a dataset is imported
  - Updated incrementally as the user changes controls
  - Reset to defaults when the user clears filters or imports a new file

## TimeFilter

- **Purpose**: Represents the available time-window modes for the filtering experience.
- **Values**:
  - `ALL`
  - `LAST_5_MINUTES`
  - `LAST_15_MINUTES`
  - `LAST_30_MINUTES`
  - `LAST_HOUR`
  - `LAST_6_HOURS`
  - `LAST_12_HOURS`
  - `LAST_24_HOURS`
  - `CUSTOM`
- **Validation rules**:
  - Relative windows must resolve from the dataset’s newest timestamp
  - `CUSTOM` requires a valid `customStart` and `customEnd`

## SeverityValue

- **Purpose**: Represents the normalized severity ranking used only for filtering decisions.
- **Values**:
  - `NOTSET`
  - `DEBUG`
  - `INFO`
  - `WARNING`
  - `ERROR`
  - `CRITICAL`
  - `UNKNOWN`
- **Behavior**:
  - Standard Python logging levels map to their normal rank order
  - Unrecognized imported levels map to `UNKNOWN`
  - `UNKNOWN` remains visible only when the minimum threshold is `NOTSET`

## LoggerOptionSet

- **Purpose**: Represents the logger options derived from the active imported dataset.
- **Fields**:
  - `values: string[]` - unique logger names, sorted alphabetically, preserving imported casing
  - `count: number` - number of distinct logger options
- **Derivation rules**:
  - Built from imported rows only
  - Recomputed when a new dataset is imported
  - Not persisted across imports

## FilteredResultSummary

- **Purpose**: Represents the visible outcome of the current filter state.
- **Fields**:
  - `visibleCount: number` - number of rows remaining after all active filters
  - `totalCount: number` - number of imported rows available before filtering
  - `hasActiveFilters: boolean` - whether any non-default filter is active
  - `isEmptyResult: boolean` - whether filtering currently excludes all visible rows
  - `latestTimestamp: Date | null` - newest timestamp in the active dataset
- **Usage**:
  - Drives the “Showing X of Y entries” message
  - Drives the empty-results state and clear-filters action

## Relationships

- `FilterState` is applied to imported `ParsedLogRow[]` from the active `ImportSession`
- `LoggerOptionSet` is derived from the active imported dataset and informs valid `selectedLoggers`
- `FilteredResultSummary` is derived from the active dataset plus the current `FilterState`
- `TimeFilter` and `SeverityValue` define comparison rules used by the filtering pipeline