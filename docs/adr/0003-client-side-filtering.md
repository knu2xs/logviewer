# ADR 0003: Client-Side Filtering Architecture

## Status
Accepted

## Context
The log viewer now needs message search, logger selection, severity filtering, and dataset-anchored time windows over a single imported log dataset. The existing import workflow already stores parsed rows in a dedicated import-session Zustand store and renders them through AG Grid. The new filtering experience must remain understandable for non-technical users, preserve imported rows as the source of truth, and stay responsive on large datasets.

## Decision
Use a dedicated client-side filter-state store for the active imported dataset. Keep imported rows immutable in the existing import-session store and apply a pure application-owned filtering pipeline outside AG Grid built-in filters.

The filtering architecture consists of:

- explicit domain contracts for filter state, time windows, severity ranking, and filtered result summaries in `src/core/models`
- a dedicated `src/store/logFilterStore.ts` for active filter values and reset actions
- pure filtering utilities in `src/filters/` that accept imported rows plus filter state and return visible rows
- severity normalization in the filter layer, where unknown levels map to `UNKNOWN` and remain visible only when the minimum filter is `NOTSET`
- relative time windows calculated from the newest timestamp in the active imported dataset rather than from the system clock

## Consequences

- Imported rows remain the single source of truth and are not duplicated as derived filtered state inside the store.
- Filtering logic is easy to unit test independently of React rendering and AG Grid behavior.
- Resetting filters on new import is explicit and isolated from import-session metadata.
- AG Grid remains responsible for virtualization and display, while the application remains responsible for business filtering rules.
- Future parser normalization can evolve independently from the current severity-filter behavior.