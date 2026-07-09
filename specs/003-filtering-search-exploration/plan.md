# Implementation Plan: Filtering, Search, and Exploration

**Branch**: `[003-filtering-search-exploration]` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-filtering-search-exploration/spec.md`

## Summary

Add an investigation-focused filtering experience on top of the existing single-file import workflow. The implementation will keep imported rows immutable in the existing import session store, introduce a dedicated filter-state store, and apply a pure filtering pipeline for message search, time windows, logger selection, and severity thresholds before passing visible rows into the existing AG Grid surface. The plan keeps the feature as a single vertical slice with unit coverage for filter logic and Playwright coverage for the browser workflow.

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: Mantine 9, Zustand 5, AG Grid 36, dayjs 1.11, Vite 8

**Storage**: In-memory browser state only; no persistent storage in this slice

**Testing**: Vitest 4 for filter logic and component/store tests, Playwright 1.61 for browser-visible workflows

**Target Platform**: Modern desktop browsers running the Vite single-page application

**Project Type**: Web application

**Performance Goals**: Debounced message search at 250ms, filter recomputation that remains subjectively responsive on 50,000 imported rows, and continued use of grid virtualization for rendering

**Constraints**: Filters reset on each new import, relative time windows anchor to the dataset’s newest timestamp, no query syntax or regex support, and imported source rows remain immutable throughout filtering

**Scale/Scope**: One active imported dataset at a time, 50,000+ log rows, dozens to hundreds of unique logger values, and four composable filter dimensions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Domain Contracts First**: PASS. New filter domain concepts will be modeled explicitly in `src/core/models` before UI wiring.
- **Mantine Shell Architecture**: PASS. Filter controls and empty states remain in the existing page/component layout and use Mantine primitives.
- **Testable by Default**: PASS. The design includes unit tests for the filter pipeline and Playwright coverage for combined filtering workflows.
- **ADR-Backed Decisions**: PASS WITH REQUIRED FOLLOW-UP. Before implementation, add a new ADR documenting client-side filter-state ownership, severity ranking, and the decision to keep filtering outside AG Grid built-in filters.
- **Small Vertical Slices**: PASS. The slice adds investigation controls to the existing import workflow without introducing saved searches, analytics, or export.

**Post-Design Re-Check**: PASS. Research and design artifacts preserve a single-slice implementation, explicit domain contracts, Mantine-based UI, required automated validation, and a documented ADR follow-up before code changes begin.

## Project Structure

### Documentation (this feature)

```text
specs/003-filtering-search-exploration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── filter-experience.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
│   ├── log-import/
│   └── log-filter/
├── core/
│   ├── models/
│   └── parsers/
├── filters/
├── pages/
├── store/
└── styles/

tests/
└── e2e/
```

**Structure Decision**: Keep the existing single-project web app structure. Add new filter domain contracts under `src/core/models`, pure filtering pipeline utilities under `src/filters`, filter-state ownership under `src/store`, and browser-facing filter controls under `src/components/log-filter` and `src/pages`. Reuse the current import session store and AG Grid results surface rather than creating a parallel feature stack.

## Complexity Tracking

No constitution violations require justification.
