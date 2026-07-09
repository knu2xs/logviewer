# Research: Filtering, Search, and Exploration

## Decision: Keep filter state separate from import session state

- **Decision**: Create a dedicated filter-state store for the active dataset instead of extending the current import-session store with all filter behavior.
- **Rationale**: The import store already owns file metadata, parsed rows, and import lifecycle state. Filters are a separate concern with their own reset behavior on new import. Separating them keeps the imported dataset immutable and makes filter resets explicit.
- **Alternatives considered**:
  - Extend `logImportStore` with all filter fields and actions: rejected because it mixes import lifecycle with view-state behavior and makes reset semantics harder to reason about.
  - Put filter state in the global app store: rejected because the state is feature-specific and tied only to the active imported dataset.

## Decision: Use a pure filtering pipeline outside React components and outside AG Grid built-in filters

- **Decision**: Implement `applyFilters()` and focused helper functions in `src/filters/` as pure functions that accept imported rows plus filter state and return visible rows.
- **Rationale**: The spec explicitly requires combined filtering and the user asked for a filter engine outside React components. Pure functions are easy to unit test, keep filtering logic independent from UI rendering, and avoid mutating imported rows. Passing filtered rows into AG Grid keeps the browser workflow predictable and avoids mixing custom business rules with grid-owned filter state.
- **Alternatives considered**:
  - Store filtered rows directly in Zustand: rejected because it duplicates source data, risks stale derived state, and adds synchronization complexity.
  - Use AG Grid built-in filter APIs: rejected because custom time-window semantics, severity ranking, and reset behavior are clearer and easier to test in application-owned logic.

## Decision: Start with a debounced case-insensitive substring search over message text only

- **Decision**: Apply a 250ms debounce to message search and evaluate it as a case-insensitive substring match against `row.message` only.
- **Rationale**: This matches the feature scope exactly, keeps the experience understandable for non-technical users, and avoids introducing query syntax or a secondary search language. With a 250ms debounce and the existing virtualized grid, straightforward substring matching remains a reasonable first implementation target for 50,000 rows.
- **Alternatives considered**:
  - Full-text indexing with FlexSearch: rejected for the first slice because it adds indexing lifecycle complexity that is not yet justified by the current scope.
  - Immediate per-keystroke filtering with no debounce: rejected because it increases unnecessary recomputation and conflicts with the specified debounce requirement.

## Decision: Anchor relative time windows to the newest imported timestamp

- **Decision**: Calculate relative windows such as last hour or last 24 hours from the latest timestamp in the active imported dataset.
- **Rationale**: The feature spec explicitly requires historical datasets to behave relative to their own timeline instead of the system clock. This keeps the controls trustworthy for archived troubleshooting logs.
- **Alternatives considered**:
  - Use the current system clock: rejected because historical datasets would produce misleading empty results.
  - Use the earliest timestamp as the anchor: rejected because relative windows are intended to focus on the most recent portion of the imported dataset.

## Decision: Normalize severity comparison in the filter layer, not in the parser

- **Decision**: Introduce a filter-domain severity ranking that maps recognized Python logging levels to ordered values and treats unrecognized levels as `UNKNOWN`, visible only when the minimum threshold is the broadest setting.
- **Rationale**: The spec requires unknown severities to remain visible only at the broadest filter setting, while future parser normalization is explicitly deferred. Keeping the mapping in the filter layer satisfies the current feature without changing import behavior.
- **Alternatives considered**:
  - Lexical severity comparison: rejected because string ordering does not match severity semantics.
  - Parser-level normalization in this slice: rejected because parser normalization is outside the stated scope for this feature.

## Decision: Require a dedicated ADR before implementation begins

- **Decision**: Add a new ADR for client-side filtering architecture before implementation starts.
- **Rationale**: The constitution requires ADR-backed decisions for non-trivial architecture choices. Filter-state ownership, external filtering versus AG Grid filtering, and severity normalization are long-lived decisions that should be captured explicitly.
- **Alternatives considered**:
  - Rely only on this plan: rejected because implementation guidance alone does not satisfy the constitution’s ADR requirement.