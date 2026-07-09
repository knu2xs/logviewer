# Implementation Plan: Log Import

**Branch**: `002-log-import` | **Date**: 2026-07-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-log-import/spec.md`

## Summary

Implement a browser-based log import flow that reads a local file, parses supported delimited log lines into `LogEntry` rows, records malformed-line errors without blocking valid rows, and renders the results in a virtualized grid with empty-state and summary feedback.

## Technical Context

**Language/Version**: TypeScript 6.0 with React 19

**Primary Dependencies**: Vite 8, Mantine 9, AG Grid 36, Zustand 5, Vitest 4, Playwright 1.61

**Storage**: In-memory only for v1; local files are read through the browser File API and are not persisted

**Testing**: Vitest for parser and state logic; Playwright for browser-visible import flows

**Target Platform**: Desktop browser web app

**Project Type**: Web application

**Performance Goals**: Import typical log files within a few seconds and keep the UI responsive for 10,000+ lines

**Constraints**: Local-file import only, no search/filtering/statistics in this slice, malformed lines must not stop valid-row processing, and the shell must remain buildable throughout

**Scale/Scope**: Single-feature slice in an existing React application shell with one import session at a time

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Domain Contracts First: pass. The feature builds on the existing `LogEntry` and `LogParser` contracts in `src/core` and adds import-session data around them.
- Mantine Shell Architecture: pass. The import flow stays inside the existing React + Mantine shell and page structure.
- Testable by Default: pass. The slice will be covered by parser/state unit tests and browser-visible import smoke tests.
- ADR-Backed Decisions: pass. The parser/import approach is consistent with the ADR already recorded in `docs/adr`.
- Small Vertical Slices: pass. The scope stays limited to file selection, parsing, results display, and error reporting.

## Project Structure

### Documentation (this feature)

```text
specs/002-log-import/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
├── core/
│   ├── models/
│   └── parsers/
├── pages/
├── store/
├── styles/
└── tests/

tests/
└── e2e/
```

**Structure Decision**: Use the existing single-page React application layout. Feature code will live primarily in `src/core/models`, `src/core/parsers`, `src/pages`, `src/store`, and `tests/e2e`. No external API or contract folder is required for this slice because the feature is entirely internal to the browser app.

## Complexity Tracking

No constitution violations require justification for this slice.
